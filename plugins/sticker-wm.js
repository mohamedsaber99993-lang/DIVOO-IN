import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text, args }) => {
  // 1. التحقق الاستباقي: التأكد من أن المستخدم قام بالرد على رسالة
  if (!m.quoted) throw `✳️ يرجى الرد على الملصق المراد تعديل حقوقه.`
  
  let stiker = false
       // تقسيم النص المكتوب لتحديد اسم الحقوق والمؤلف الجديد (مثال: حقوقي|اسمي)
       let stick = args.join(" ").split("|");
       let f = stick[0] !== "" ? stick[0] : packname;
       let g = typeof stick[1] !== "undefined" ? stick[1] : author;
       
  try {
    let mime = m.quoted.mimetype || ''
    // 2. التأكد من أن الملف الذي تم الرد عليه هو ملصق بصيغة webp فعلياً
    if (!/webp/.test(mime)) throw `✳️ عذراً، هذا الأمر يعمل فقط عند الرد على الملصقات.`
    
    let img = await m.quoted.download()
    if (!img) throw `❌ فشل تحميل الملصق، يرجى المحاولة مرة أخرى.`
    
    // 3. حقن الحقوق البرمجية الجديدة (Exif Metadata) داخل ملف الملصق
    stiker = await addExif(img, f, g)
    
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    // 4. النتيجة النهائية: إرسال الملصق بالحقوق الجديدة أو عرض رسالة الخطأ
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m)
     else throw '❌ فشلت عملية تحويل وتعديل حقوق الملصق.'
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تعديل_الحقوق <الحزمة>|<المؤلف>']
handler.tags = ['قسم الملصقات (Stickers)']

// mصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['take', 'wm', 'حقوق', 'سرقة', 'اخذ'] 

export default handler
