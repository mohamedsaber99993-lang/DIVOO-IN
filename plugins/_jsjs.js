import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. جلب مصفوفة روابط الصور من ملف جيسون (JSON) المستضاف على مستودع GitHub
    let img = (await axios.get(`https://raw.githubusercontent.com/fgmods/fg-team/main/img/hu.json`)).data 
    
    // 2. اختيار رابط صورة عشوائي من القائمة وتحويله إلى ملصق (Sticker) باستخدام اسم الحقوق والحزمة الافتراضية
    let stiker = await sticker(null, `${pickRandom(img)}`, global.packname, global.author)
    
    // 3. إذا تم إنشاء الملصق بنجاح، يقوم البوت بإرساله فوراً إلى المحادثة كملصق متحرك/ثابت
    if (stiker) return await conn.sendFile(m.chat, stiker, 'sticker.webp', { asSticker: true }, m)
    
    // في حال حدوث خطأ أثناء المعالجة، يتم إطلاق الخطأ برمجياً
    throw stiker.toString()   
}

// الكلمة المفتاحية أو الاختصار الذي يستجيب له البوت تلقائياً (يمكنك تعديل "jsjs" لأي كلمة تريدها مثل "هههه")
handler.customPrefix = /^(عوجه)$/i
handler.command = new RegExp

export default handler

/**
 * دالة برمجية لاختيار عنصر واحد بشكل عشوائي من مصفوفة (Array)
 * @param {Array} list قائمة العناصر أو الروابط
 * @returns {*} عنصر عشوائي من القائمة
 */
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
