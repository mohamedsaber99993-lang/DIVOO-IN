const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser
} = await import('@whiskeysockets/baileys')

import NodeCache from "node-cache"
import crypto from "crypto"
import fs from "fs"
import pino from "pino"
import readline from "readline"
import { Boom } from "@hapi/boom"
import { makeWASocket } from "../lib/simple.js"

// التأكد من تهيئة مصفوفة الاتصالات العالمية لحفظ جلسات البوتات الفرعية النشطة
if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn: parent, args, usedPrefix, command }) => {

// قيد أمني: التحقق مما إذا كان الأمر يُنفذ من البوت الرئيسي أو يحتوي على كلمة المرور التمكينية
if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == parent.user.jid)) {
  throw `📌 هذا الأمر لا يمكن استخدامه إلا من خلال البوت الرئيسي فقط\n\n يمكنك طلبه من هنا: wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}botclone`
}

async function startBot() {

let authFolderB
// توليد اسم عشوائي فريد لمجلد الحفظ الخاص بالبوت الفرعي لتجنب تداخل البيانات
let nameR = `senna_${crypto.randomBytes(10).toString('base64').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6)}`

// التحقق مما إذا كان المستخدم يمتلك مجلداً سابقاً (إعادة اتصال باستخدام المعرف ID)
if (args[0] && fs.existsSync(`./bebots/${args[0]}`)) {

  authFolderB = args[0]

  // إذا كان المجلد موجوداً ولكن ملف الجلسة تالف، يتم حذفه وإنشاء معرف جديد
  if (!fs.existsSync(`./bebots/${authFolderB}/creds.json`)) {
    fs.rmSync(`./bebots/${authFolderB}`, { recursive: true, force: true })
    authFolderB = nameR
    fs.mkdirSync(`./bebots/${authFolderB}`, { recursive: true })
  }

} else {
  // إنشاء جلسة جديدة تماماً للمستخدم
  authFolderB = nameR
  fs.mkdirSync(`./bebots/${authFolderB}`, { recursive: true })
}

// تهيئة وإعداد نظام حفظ الحالة والتوثيق للمجلد المخصص
const { state, saveCreds } = await useMultiFileAuthState(`./bebots/${authFolderB}`)

const msgRetryCounterCache = new NodeCache()
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })

// جلب أحدث إصدار متوافق من مكتبة Baileys لتفادي مشاكل الاتصال بالواتساب
const { version } = await fetchLatestBaileysVersion()

let phoneNumber
try {
  phoneNumber = await parent.getNum(m.sender) // استخراج رقم هاتف مرسل الأمر
} catch {
  phoneNumber = null
}

const methodCode = !!phoneNumber || process.argv.includes("code")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

// إعداد خيارات وبنية الاتصال الخاصة بالبوت الفرعي الجديد
const connectionOptions = {
  logger: pino({ level: "silent" }), // جعل السجلات صامتة لعدم ملء شاشة السيرفر بالبيانات التكرارية
  version,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
  },
  markOnlineOnConnect: true, // ظهور البوت متصلاً بمجرد اشتغاله
  generateHighQualityLinkPreview: true,
  msgRetryCounterCache,
  userDevicesCache,

  // دالة جلب الرسائل من المتجر عند الحاجة لإعادة المحاولة (Retry Mechanism)
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store?.loadMessage(jid, key.id)
      return msg?.message || ""
    } catch {
      return ""
    }
  }
}

let conn = makeWASocket(connectionOptions)

// توليد كود الربط إذا كان حساب البوت الفرعي لم يتم تسجيله أو ربطه بعد
if (methodCode && !conn.authState.creds.registered) {
  if (!phoneNumber) return

  let cleanedNumber = phoneNumber.replace(/[^0-9]/g, "") // تصفية الرقم من أي رموز أو مسافات

  setTimeout(async () => {
    try {
      // طلب كود الاقتران من خوادم واتساب الرسمية برمجياً
      let codeBot = await conn.requestPairingCode(cleanedNumber)
      // تنسيق الكود ليظهر بشكل مقروء ومنفصل بشرطة (مثل: XXXX-XXXX)
      codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot

      // إرسال صورة توضيحية مع كود الربط والخطوات باللغة العربية
      await parent.sendFile(
        m.chat,
        "https://i.ibb.co/SKKdvRb/code.jpg",
        "code.jpg",
        `➤ *كود ربط البوت الفرعي الخاص بك*

*${codeBot}*

1. افتح تطبيق الواتساب الخاص بك.
2. اضغط على القائمة الجانبية أو الإعدادات ⋮
3. اختر "الأجهزة المرتبطة" (Linked Devices).
4. اضغط على "ربط جهاز" ثم اختر "الربط باستخدام رقم الهاتف بدلاً من ذلك".
5. أدخل الكود الموضح في الأعلى بدقة.

⚠️ تنبيه: هذا الكود مخصص ومحمي ليعمل على رقمك أنت فقط المنفذ للأمر.`,
        m
      )

    } catch (err) {
      console.log("حدث خطأ أثناء توليد كود الاقتران:", err)
    }
  }, 3000)
}

conn.isInit = false
let isInit = true

// دالة إدارة وتحديث حالة الاتصال (فتح، إغلاق، أو انقطاع الجلسة)
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  if (isNewLogin) conn.isInit = true

  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

  // معالجة حالات الانقطاع وحذف الجلسة إذا قام المستخدم بتسجيل الخروج يدوياً
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    let i = global.conns.indexOf(conn)
    if (i < 0) return console.log(await reloadHandler(true).catch(console.error))

    // إزالة البوت من مصفوفة البوتات النشطة عند انقطاع اتصاله
    delete global.conns[i]
    global.conns.splice(i, 1)

    if (code === DisconnectReason.connectionClosed) {
      parent.sendMessage(m.chat, {
        text: "⛔ تم إغلاق الاتصال بشكل مفاجئ، ستحتاج إلى إعادة الاتصال مجدداً باستخدام معرفك الخاص (ID)."
      }, { quoted: m })
    }
  }

  // في حال نجاح الاتصال واستقرار البوت الفرعي مع خوادم الواتساب
  if (connection === "open") {
    conn.isInit = true
    global.conns.push(conn) // إدخال البوت الفرعي الجديد في قائمة النشاط العام

    // صياغة رسالة السجل (Log) لإرسالها لجروب المطورين أو لقناة السجلات
    let logMsg = `
┌─⊷ 🤖 *تم ربط بوت فرعي جديد بنجاح*
▢ 🤖 رابط البوت: wa.me/${conn.user?.id?.split(":")[0]}
▢ 🕒 وقت الاتصال: ${new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}
└──────────────
`
    await parent.reply(canal_logid, logMsg, m, fwc)

    // إعلام المستخدم بنجاح العملية وإرسال كود الـ ID الخاص به
    await parent.sendMessage(m.chat, {
      text: args[0]
        ? "✅ تم إعادة الاتصال بالبوت الفرعي الخاص بك بنجاح!"
        : `✅ *تم الاتصال بنجاح واشتغال البوت الفرعي الخاص بك!*

خلال ثوانٍ قليلة، سنرسل لك *المعرف الخاص (ID)* في خاص رقمك لكي تتمكن من تشغيله مجدداً إذا توقف.`
    }, { quoted: m })

    await sleep(5000)

    if (args[0]) return

    // إرسال كود الـ ID في الخاص للمستخدم للتحكم الفردي والمستقبلي بجلسه
    await parent.sendMessage(conn.user.jid, { text: "✅ مرحباً بك، البوت الخاص بك نشط الآن!" })
    await parent.sendMessage(conn.user.jid, {
      text: `إليك الأمر المخصص لإعادة تشغيل البوت في أي وقت إذا توقف دون الحاجة لطلب كود جديد، فقط قم بنسخه وإرساله في شات البوت الرئيسي:\n\n${usedPrefix + command} ${authFolderB}`
    })
  }
}

let handlerModule = await import("../handler.js")

// دالة إعادة تحميل المعالجات (Hot Reload) لتحديث الأوامر داخل البوت الفرعي تلقائياً دون الحاجة لإعادة تشغيل السيرفر بالكامل
async function reloadHandler(restatConn = false) {
  try {
    const Handler = await import(`../handler.js?update=${Date.now()}`)
    if (Object.keys(Handler || {}).length) handlerModule = Handler
  } catch (e) {
    console.error(e)
  }

  if (restatConn) {
    try { conn.ws.close() } catch {}
    conn.ev.removeAllListeners()
    conn = makeWASocket(connectionOptions)
    isInit = true
  }

  // تصفية المستمعين (Listeners) القدامى لتجنب تسريب الذاكرة (Memory Leak) والتكرار
  if (!isInit) {
    conn.ev.off("messages.upsert", conn.handler)
    conn.ev.off("group-participants.update", conn.participantsUpdate)
    conn.ev.off("groups.update", conn.groupsUpdate)
    conn.ev.off("message.delete", conn.onDelete)
    conn.ev.off("connection.update", conn.connectionUpdate)
    conn.ev.off("creds.update", conn.credsUpdate)
  }

  // مزامنة رسائل الترحيب والمغادرة والترقيات من البوت الرئيسي إلى البوت الفرعي
  conn.welcome = global.conn?.welcome || "" 
  conn.bye = global.conn?.bye || ""
  conn.spromote = global.conn?.spromote || ""
  conn.sdemote = global.conn?.sdemote || ""

  // ربط أحداث البوت المكتشفة بنظام المعالجة الفرعي
  conn.handler = handlerModule.handler.bind(conn)
  conn.participantsUpdate = handlerModule.participantsUpdate.bind(conn)
  conn.groupsUpdate = handlerModule.groupsUpdate.bind(conn)
  conn.connectionUpdate = connectionUpdate.bind(conn)
  conn.credsUpdate = saveCreds.bind(conn)

  // تفعيل الاستماع للأحداث والرسائل الجديدة داخل البوت المستنسخ
  conn.ev.on("messages.upsert", conn.handler)
  conn.ev.on("group-participants.update", conn.participantsUpdate)
  conn.ev.on("groups.update", conn.groupsUpdate)
  conn.ev.on("connection.update", conn.connectionUpdate)
  conn.ev.on("creds.update", conn.credsUpdate)

  isInit = false
  return true
}

await reloadHandler(false)

}

startBot()

}

// الأوامر التي يستجيب لها البوت لتفعيل ميزة صانع البوتات
handler.help = ["البوتات_الفرعية"]
handler.tags = ['التبويت / البوتات الفرعية']
handler.command = ["تنصيب", "ربط", "jadibot", "code", "clonebot"]

export default handler

/**
 * دالة انتظار مؤقتة (Promise-based Delay)
 * @param {number} ms عدد الميلي ثانية المراد انتظارها
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
