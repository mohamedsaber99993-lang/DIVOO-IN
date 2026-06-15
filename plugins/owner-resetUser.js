let handler = async (m, { conn }) => {

  let user
  // 1. تحديد المستخدم المستهدف بناءً على طريقة الإشارة (رد على رسالة، منشن، أو مرسل الأمر نفسه)
  if (m.quoted) {
    user = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    user = m.mentionedJid[0]
  } else {
    user = m.sender
  }

  // 2. التحقق الاستباقي: التأكد من وجود الحساب مسبقاً في قاعدة البيانات قبل محاولة حذفه
  if (!global.db.data.users[user]) {
    return m.reply('❏ هذا المستخدم غير مسجل أو لا يوجد له ملف في قاعدة البيانات.')
  }

  // 3. حذف وإزالة ملف المستخدم تماماً من ذاكرة التخزين
  delete global.db.data.users[user]

  let number = user.split('@')[0]

  // 4. إرسال رسالة التأكيد باللغة العربية مع عمل تاغ للمستخدم الذي تم تصفير بياناته
  conn.reply(
    m.chat,
    `*❏ تم تصفير وحذف المستخدم*\n\n✅ تم حذف الحساب @${number} بالكامل من قاعدة البيانات.`,
    m,
    { mentions: [user] }
  )
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تصفير_مستخدم']
handler.tags = ['إعدادات متقدمة للمطور']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['reset-user', 'resetuser', 'تصفير_مستخدم', 'حذف_بيانات']

// قفل أمان مطلق: متاح فقط وحصرياً لمالك ومنشئ البوت الأساسي لمنع العبث ببيانات الأعضاء
handler.rowner = true

export default handler
