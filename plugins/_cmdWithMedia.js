import {
  proto,
  generateWAMessageFromContent,
  areJidsSameUser
} from '@whiskeysockets/baileys'

export async function all(m, chatUpdate) {
  if (m.isBaileys) return // تجاهل الرسائل الصادرة من البوتات الأخرى
  if (!m.message) return // تجاهل الرسائل الفارغة التي لا تحتوي على أي محتوى
  if (!m.msg?.fileSha256) return // تجاهل الميديا التي لا تمتلك بصمة رقمية (مثل الرسائل النصية العادية)

  // تحويل مصفوفة بايتات البصمة الرقمية (fileSha256) الخاصة بالملصق إلى نص مشفر بصيغة base64 ليكون بمثابة مفتاح فريد
  const hashKey = Buffer.from(m.msg.fileSha256).toString('base64')
  
  // التحقق مما إذا كان هذا المفتاح (بصمة الملصق) مسجلاً مسبقاً في قاعدة بيانات الأوامر المرتبطة بالملصقات
  if (!(hashKey in global.db.data.sticker)) return

  // استخراج النص (الأمر) وقائمة الإشارات (Mentions) المرتبطة بهذا الملصق من قاعدة البيانات
  let { text, mentionedJid } = global.db.data.sticker[hashKey]

  // تجهيز محتوى الرسالة النصية الوهمية التي سيتم حقنها في النظام لتشغيل الأمر
  const msgContent = {
    conversation: text
  }

  // توليد بنية رسالة واتساب كاملة وصحيحة برمجياً بناءً على الأمر المرتبط بالملصق
  let messages = generateWAMessageFromContent(
    m.chat,
    msgContent,
    {
      userJid: this.user.id,
      quoted: m.quoted?.fakeObj // ربط الرسالة بالرسالة المقتبسة إن وجدت
    }
  )

  // ضبط إعدادات الترويسة والبيانات الفوقية للرسالة المحقونة لتطابق بيانات مرسل الملصق الأصلي
  messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
  messages.key.id = m.key.id
  messages.pushName = m.pushName
  if (m.isGroup) messages.participant = m.sender

  // تحضير كائن التحديث (Upsert Object) وضبط نوع العملية على "إلحاق" (append) لادراج الرسالة في طابور المعالجة
  const upsert = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)],
    type: 'append'
  }

  // إطلاق الحدث برمجياً (Emit Event) لخداع البوت وجعله يعتقد أن المستخدم كتب الأمر نصياً بدلاً من إرسال ملصق
  this.ev.emit('messages.upsert', upsert)
}
