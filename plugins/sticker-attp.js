import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    // 1. التحقق الاستباقي: إذا لم يقم المستخدم بكتابة النص المراد تحويله
    if (!text) throw `✳️ _يرجى كتابة النص أولاً_\n\n📌 *مثال:* ${usedPrefix + command} سياق`
    
    // استدعاء الـ API الخاص بصناعة الملصقات النصية المتحركة وتوليد الملصق
    let stiker = await sticker(null, global.API('fgmods', '/api/maker/attp', { text }, 'apikey'), global.packname, global.author)
    
    // 2. إرسال الملصق المتحرك إلى الدردشة في حال تم إنشاؤه بنجاح
    if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m )
    
    throw stiker.toString()
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['نص_متحرك <النص>']
handler.tags = ['قسم الملصقات (Stickers)']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['attp', 'نص_متحرك', 'ملصق_نصي'] 

export default handler
