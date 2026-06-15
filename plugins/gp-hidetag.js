import MessageType from '@whiskeysockets/baileys'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, participants }) => {
    
    // 1. كشط وفك تشفير المعرفات (JIDs) لجميع الأعضاء المتواجدين في المجموعة حالياً
    let users = participants.map(u => conn.decodeJid(u.id))
    
    // تحديد الرسالة المستهدفة (سواء كانت نصاً جديداً أو رسالة مقتبسة تم الرد عليها)
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? m.quoted : m.msg
    
    // 2. هندسة بناء وتعديل حزمة الرسالة (Message Modification Engine)
    const msg = conn.cMod(m.chat,
        generateWAMessageFromContent(m.chat, {
            // تحديد نوع محتوى الرسالة ديناميكياً (نص ممتد أو كائن JSON ممرر)
            [c.toJSON ? q.mtype : 'extendedTextMessage']: c.toJSON ? c.toJSON() : {
                text: c || ''
            }
        }, {
            quoted: m,
            userJid: conn.user.id
        }),
        // دمج النص المدخل الجديد أو الاحتفاظ بالنص الأصلي مع حقن قائمة المنشن المخفية
        text || q.text, conn.user.jid, { mentions: users }
    )
    
    // 3. بث وإرسال الرسالة المعدلة مباشرة إلى خوادم واتساب باستخدام بروتوكول الترحيل الفوري
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['منشن_مخفي [النص]']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['منشن_مخفي', 'نداء', 'تعميم', 'hidetag', 'notify'] 

// أقفال الحماية والصلابة البرمجية للأمر
handler.group = true // يعمل هذا الأمر داخل المجموعات فقط لمنع انهيار السيرفر في الخاص
handler.admin = true // قفل حماية: يسمح للمشرفين فقط باستخدام هذا الأمر لتفادي إزعاج الأعضاء

export default handler
