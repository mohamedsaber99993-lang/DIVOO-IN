import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  // جلب أسماء جميع ملفات الإضافات (Plugins) المتاحة وتنظيفها من صيغة الامتداد .js
  const pluginNames = Object.keys(global.plugins)
    .map(name => name.replace('.js', ''))

  // 1. التحقق الاستباقي: إذا لم يقم المطور بكتابة اسم الملف المطلوب
  if (!text) {
    return m.reply(`
✳️ طريقة استخدام الأمر:
${usedPrefix + command} <اسم_الملف>

📌 *مثال:*
${usedPrefix + command} main-menu
`.trim())
  }

  // 2. إذا كان الاسم المدخل غير متطابق مع أي ملف متوفر في السيرفر، يتم عرض القائمة المتاحة
  if (!pluginNames.includes(text)) {
    return m.reply(`
📌 *مثال:*
${usedPrefix + command} main-menu

≡ *قائمة ملفات الإضافات المتوفرة (Plugins)*
┌─⊷
${pluginNames.map(name => `▢ ${name}`).join('\n')}
└───────────
`.trim())
  }

  try {
    const pluginPath = path.join('./plugins', `${text}.js`)

    // التحقق من الوجود الفعلي للملف في المسار المحدد
    if (!fs.existsSync(pluginPath))
      return m.reply('❎ هذا الملف غير موجود أو تم حذفه من مجلد الإضافات الأساسي.')

    // قراءة محتوى الملف البرمجي وتحويله إلى بافر (Buffer)
    const fileBuffer = fs.readFileSync(pluginPath)

    // 3. إرسال الملف مباشرة إلى شات المطور كمستند جافا سكريبت (Document)
    await conn.sendMessage(m.chat, {
      document: fileBuffer,
      mimetype: 'application/javascript',
      fileName: `${text}.js`
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❎ خطأ برمي داخلي: فشل إرسال واستخراج ملف الإضافة المطلوب.')
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['جلب_ملف <اسم_الملف>']
handler.tags = ['إعدادات متقدمة للمطور']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['getplugin', 'جلب_ملف', 'الملف', 'احضر_ملف']

// قفل أمان مطلق: متاح فقط وحصرياً لمالك ومنشئ البوت الأساسي لحماية الأكواد البرمجية من التسريب
handler.rowner = true

export default handler
