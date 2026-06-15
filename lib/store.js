import { readFileSync, writeFileSync, existsSync } from 'fs'
import {
    jidNormalizedUser,
    initAuthCreds,
    BufferJSON,
    proto
} from '@whiskeysockets/baileys'

/* ==========================================
          مستودع تخزين وإدارة المحادثات (STORE)
========================================== */
function bind(conn) {
    if (!conn.chats) conn.chats = {}
    if (!conn.messages) conn.messages = {}

    // دالة تحديث أو إنشاء المحادثة في الذاكرة المؤقتة
    const upsertChat = (id, data = {}) => {
        id = jidNormalizedUser(id)
        if (!id || id === 'status@broadcast') return
        conn.chats[id] = {
            ...(conn.chats[id] || {}),
            id,
            ...data
        }
    }

    /* ==========================================
      حفظ الرسائل (ميزة الحماية من الحذف Anti-Delete)
    ========================================== */
    conn.ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages) {
            if (!msg?.key?.remoteJid || !msg.message) continue

            const jid = msg.key.remoteJid
            const id = msg.key.id
            if (!conn.messages[jid]) conn.messages[jid] = {}

            // تخزين الرسالة الخام للرجوع إليها في حال تم حذفها من الطرف الآخر
            conn.messages[jid][id] = msg

            // حفظ الرسالة بالاقتران مع معرف المُرسِل بصيغة نصية صحيحة
            if (msg.key.participant) {
                conn.messages[jid][`${id}_${msg.key.participant}`] = msg
            }
        }
    })

    /* ==========================================
      إدارة جهات الاتصال والمجموعات (CONTACTS)
    ========================================== */
    const updateContacts = (contacts) => {
        contacts = contacts?.contacts || contacts
        if (!contacts) return
        for (const contact of contacts) {
            const id = jidNormalizedUser(contact.id)
            if (!id || id === 'status@broadcast') continue
            const isGroup = id.endsWith('@g.us')

            // تحديث اسم جهة الاتصال أو عنوان المجموعة في قاعدة البيانات المؤقتة
            upsertChat(id, {
                ...(isGroup
                    ? { subject: contact.subject || contact.name }
                    : { name: contact.notify || contact.name })
            })
        }
    }

    conn.ev.on('contacts.upsert', updateContacts)
    conn.ev.on('contacts.update', updateContacts)
    conn.ev.on('contacts.set', updateContacts)

    /* ==========================================
      إدارة وتحديث البيانات الهيكلية للدردشات (CHATS)
    ========================================== */
    conn.ev.on('chats.set', async ({ chats }) => {
        for (let { id, name, readOnly } of chats) {
            id = jidNormalizedUser(id)
            if (!id || id === 'status@broadcast') continue
            const isGroup = id.endsWith('@g.us')

            upsertChat(id, {
                isChats: !readOnly,
                ...(name && (isGroup ? { subject: name } : { name }))
            })

            // إذا كانت الدردشة مجموعة، يتم جلب تفاصيلها (Metadata) وتخزينها
            if (isGroup) {
                const metadata = await conn.groupMetadata(id).catch(() => null)
                if (metadata) {
                    upsertChat(id, {
                        subject: metadata.subject,
                        metadata
                    })
                }
            }
        }
    })

    conn.ev.on('chats.upsert', (chats) => {
        if (!Array.isArray(chats)) return
        for (const chat of chats) {
            if (!chat?.id) continue
            const id = jidNormalizedUser(chat.id)
            upsertChat(id, { ...chat, isChats: true })
        }
    })

    /* ==========================================
      المجموعات - التحديثات العامة للإعدادات والأسماء
    ========================================== */
    conn.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            const id = jidNormalizedUser(update.id)
            if (!id?.endsWith('@g.us')) continue
            let metadata = conn.chats[id]?.metadata

            if (!metadata) {
                try {
                    metadata = await conn.groupMetadata(id)
                } catch (e) {
                    if (e?.data === 403) continue // تخطي إذا كان البوت لا يملك صلاحية الوصول
                    console.error('حدث خطأ أثناء جلب بيانات المجموعة:', e)
                    continue
                }
            }

            upsertChat(id, {
                subject: update.subject || metadata.subject,
                metadata,
                isChats: true
            })
        }
    })

    /* ==========================================
      المجموعات - إدارة الأعضاء والمشاركين (الأحداث)
    ========================================== */
    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
            id = jidNormalizedUser(id)
            if (!id?.endsWith('@g.us')) return

            let metadata = conn.chats[id]?.metadata
            if (!metadata) {
                try {
                    metadata = await conn.groupMetadata(id)
                } catch (e) {
                    if (e?.data === 403) {
                        console.log('⚠️ خطأ 403 - لا توجد صلاحية للوصول إلى بيانات المجموعة:', id)
                        return
                    }
                    console.error('حدث خطأ في تحديث المشاركين:', e)
                    return
                }
            }

            upsertChat(id, {
                subject: metadata.subject,
                metadata,
                isChats: true
            })
            console.log(`📢 المجموعة: ${metadata.subject} ← حدث إجراء [${action}] للأعضاء:`, participants)
        } catch (err) {
            console.error('خطأ في حدث group-participants.update:', err)
        }
    })

    /* ==========================================
      تحديثات الحالة والظهور (PRESENCE)
    ========================================== */
    conn.ev.on('presence.update', ({ id, presences }) => {
        const sender = Object.keys(presences || {})[0]
        if (!sender) return
        const normalized = jidNormalizedUser(sender)
        const presence = presences[sender]?.lastKnownPresence || 'available'

        // تحديث حالة العضو (متصل، يكتب الآن، يسجل مقطعاً صوتياً)
        upsertChat(normalized, { presence })
    })

    /* ==========================================
      رسائل النظام الفرعية والبنية التحتية (STUBS)
    ========================================== */
    conn.ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages) {
            if (!msg.messageStubType) continue
            const chatId = jidNormalizedUser(msg.key.remoteJid)
            const user = msg.messageStubParameters?.[0]
        }
    })
}

/* ==========================================
  إدارة جلسة الاتصال والحفظ التلقائي الذكي (AUTH)
========================================== */
const KEY_MAP = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
}

function useSingleFileAuthState(filename, logger) {
    let creds
    let keys = {}
    let saveCount = 0

    // دالة حفظ حالة الجلسة وتجنب الضغط على القرص الصلب عن طريق الجدولة الجافة
    const saveState = (forceSave = false) => {
        saveCount++
        if (forceSave || saveCount > 5) {
            writeFileSync(
                filename,
                JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
            )
            saveCount = 0
        }
    }

    // التحقق من وجود ملف الجلسة مسبقاً لاستئناف الاتصال أو إنشاء جلسة جديدة
    if (existsSync(filename)) {
        const result = JSON.parse(
            readFileSync(filename, 'utf-8'),
            BufferJSON.reviver
        )
        creds = result.creds
        keys = result.keys
    } else {
        creds = initAuthCreds()
        keys = {}
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type]
                    return ids.reduce((dict, id) => {
                        let value = keys[key]?.[id]
                        if (value && type === 'app-state-sync-key') {
                            value = proto.AppStateSyncKeyData.fromObject(value)
                        }
                        if (value) dict[id] = value
                        return dict
                    }, {})
                },
                set: (data) => {
                    for (const type in data) {
                        const key = KEY_MAP[type]
                        keys[key] = keys[key] || {}
                        Object.assign(keys[key], data[type])
                    }
                    saveState()
                }
            }
        },
        saveState
    }
}

// دالة محاكاة لتحميل الرسائل بشكل آمن عند استدعائها في السورس
async function loadMessage(jid, id) {
    return global.conn?.messages?.[jid]?.[id] || null
}

export default {
    bind,
    useSingleFileAuthState,
    loadMessage
}
