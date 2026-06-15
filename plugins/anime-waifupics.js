import fetch from 'node-fetch'
import axios from 'axios'
import fg from "fg-senna"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // إظهار تفاعل الانتظار المؤقت (مثل جاري التحميل)
    m.react(rwait)

    // تحويل الأمر المكتوب إلى أحرف صغيرة لتفادي مشاكل حساسية حالة الأحرف
    let type = (command).toLowerCase()

    switch (type) {
        // الحالة الأولى: جلب صور عشوائية باستخدام مكتبة fg-senna
        case 'loli':
        case 'neko':
            const cmd = command.toLowerCase()
            // استدعاء الدالة برمجياً من المكتبة بناءً على اسم الأمر (مثال: fg.loli() أو fg.neko())
            const img = await fg[cmd]() 
            
            // إرسال الصورة الناتجة إلى المحادثة مع نص توضيحي باللغة العربية
            conn.sendFile(m.chat, img, 'img.jpg', `✅ صورة *${command}* عشوائية`, m)
            // إظهار تفاعل النجاح (تم)
            m.react(dmoji) 
            break
        
        // الحالة الثانية: جلب صور عشوائية من واجهة برمجة تطبيقات خارجية (waifu.pics)
        case 'waifu':
        case 'megumin':
            let res = await fetch(`https://api.waifu.pics/sfw/${command}`)
            if (!res.ok) throw await res.text() // إطلاق خطأ إذا فشل الاتصال بالخادم
            
            let json = await res.json()
            if (!json.url) throw '❎ حدث خطأ أثناء جلب الصورة'
            
            // إرسال الصورة المجلوبة عبر الرابط إلى المحادثة
            conn.sendFile(m.chat, json.url, 'img.jpg', `✅ صورة *${command}* عشوائية`, m)
            m.react(dmoji) 
            break

        default:
            // تترك فارغة للتعامل مع أي أوامر غير مدرجة بشكل آمن
    } 
}

// إعدادات المساعدة والتصنيف الخاصة بالإضافة داخل نظام البوت
handler.help = ['waifu', 'neko', 'megumin', 'loli']
handler.tags = ['anime'] // تم تعديل الوسم ليكون واضحاً بالإنجليزية المعيارية للأنمي
handler.command = ['waifu', 'neko', 'megumin', 'loli'] 

export default handler

/**
 * دالة برمجية مساعدة لاختيار عنصر عشوائي من مصفوفة
 * @param {Array} list قائمة العناصر
 * @returns {*} عنصر عشوائي من القائمة
 */
function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}
