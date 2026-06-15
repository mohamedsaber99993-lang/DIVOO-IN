import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    // 1. جلب ملف الفيديو ديناميكياً من واجهة البرمجية المعتمدة في النظام
    let img = await conn.getFile(global.API('fgmods', '/api/img/asupan-la', { }, 'apikey'))
    let asupan = img.data

    // 2. إرسال ملف الفيديو النهائي إلى المحادثة مع نص التأكيد باللغة العربية
    conn.sendFile(m.chat, asupan, 'vid.mp4', `✅ تم التحميل بنجاح`, m, null, fwc)
    
    // وضع تفاعل تلقائي (إيموجي) على رسالة المستخدم لإشارة إتمام الإرسال
    m.react('🤓')
  
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['فيديو_عشوائي']
handler.tags = ['الوسائط والترفيه']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['فيديو', 'مقطع', 'فديو', 'asupan', 'tvid', 'videos', 'vid', 'video']

// إعدادات القيود والاقتصاد الخاص بالأمر (RPG لتعزيز التفاعل)
handler.premium = false     // متاح لجميع الأعضاء ولا يشترط العضوية الفخمة
handler.diamond = true      // يخصم (1 ألماس) من حساب المستخدم عند كل استخدام كميزة توازن اقتصادي

export default handler
