import { sticker } from '../lib/sticker.js'
import fg from 'fg-senna'

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // 1. التحقق الاستباقي: إذا لم يقم المستخدم بكتابة النص المراد تحويله
    if (!text) throw `📌 *مثال على الاستخدام:* ${usedPrefix + command} سياق` 
    
    // تحديد درجة اللون المخصص للملصق النصي الثابت
    let color = '2FFF2E' 
    
    // استدعاء مكتبة توليد الملصقات النصية وجلب رابط النتيجة
    let res = await fg.ttp(text, color) 
    
    // 2. تحويل الرابط المستخرج إلى ملصق واتساب متوافق
    let stiker = await sticker(null, res.result, global.packname, global.author)
    
    // 3. إرسال الملصق النهائي إلى الدردشة بنجاح
    if (stiker) return await conn.sendFile(m.chat, stiker, '', '', m)
    
    throw stiker.toString()
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['نص_ملون <النص>']
handler.tags = ['قسم الملصقات (Stickers)']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['ttp', 'نص_ثابت', 'نص_ملون']

export default handler
