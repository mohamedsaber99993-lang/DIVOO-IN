import gtts from 'node-gtts'
import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

// تحديد لغة النطق الافتراضية للمحرك (تم تعديلها إلى العربية 'ar')
const defaultLang = 'ar'

let handler = async (m, { conn, args, usedPrefix, command }) => {

  let lang = args[0]
  let text = args.slice(1).join(' ')
  
  // التحقق من رمز اللغة المكون من حرفين، وإذا لم يطابق يتم اعتماد اللغة الافتراضية
  if ((args[0] || '').length !== 2) {
    lang = defaultLang
    text = args.join(' ')
  }
  
  // إذا لم يكتب نصاً ولكنه قام بالرد على رسالة نصية، يتم جلب نص الرسالة المقتبسة
  if (!text && m.quoted?.text) text = m.quoted.text

  let res
  try { 
    // محاولة تحويل النص إلى كلام باستخدام الدالة المساعدة
    res = await tts(text, lang) 
  } catch (e) {
    m.reply(e + '')
    text = args.join(' ')
    
    // رسالة إرشادية باللغة العربية في حال عدم وجود أي نص منطوق
    if (!text) throw `📌 *مثال على الاستخدام:* \n${usedPrefix}${command} en hello world`
    
    // خطة بديلة: إعادة المحاولة باللغة الافتراضية
    res = await tts(text, defaultLang)
  } finally {
    // إرسال الملف الصوتي الناتج مباشرة كرسالة صوتية (ptt: true)
    if (res) conn.sendFile(m.chat, res, 'audio.ogg', '', m, true, { asAudio: true, ptt: true})
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['نطق <الرمز> <النص>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['tts', 'voz', 'نطق', 'صوت'] 

export default handler

// دالة برمجة مساعدة مسؤولة عن معالجة الصوت وحفظ الملف مؤقتاً ثم قراءته وحذفه
function tts(text, lang = 'ar') {
  console.log(lang, text)
  return new Promise((resolve, reject) => {
    try {
      let tts = gtts(lang)
      // تحديد مسار حفظ الملف المؤقت داخل مجلد tmp
      let filePath = join(global.__dirname(import.meta.url), '../tmp', (1 * new Date) + '.wav')
      
      // توليد وحفظ الملف الصوتي
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath))
        // حذف الملف المؤقت من السيرفر فوراً بعد قراءته للحفاظ على المساحة
        unlinkSync(filePath)
      })
    } catch (e) { reject(e) }
  })
}
