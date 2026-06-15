import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn }) => {
    
    // 1. التحقق الاستباقي: التأكد من أن النص المدخل يبدأ ببروتوكول ويب صحيح (http:// أو https://)
    if (!/^https?:\/\//.test(text)) throw `✳️ عذراً، يجب أن يكون الإدخال رابطاً صالحاً يبدأ بـ http:// أو https://`
    
    let _url = new URL(text)
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY')
    
    // بدء عملية الاتصال وجلب بيانات الرابط
    let res = await fetch(url)
    
    // قفل الحماية: التحقق من حجم الملف المستهدف لضمان عدم تحميل ملفات ضخمة تستهلك موارد السيرفر
    if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
        throw `حجم الملف كبير جداً وغير مسموح بتحميله: ${res.headers.get('content-length')}`
    }
    
    // 2. إذا لم يكن محتوى الرابط نصياً أو برمجياً (مثل الصور، الفيديوهات، أو المستندات)، يتم تحميله وإرساله كملف مباشرة
    if (!/text|json/.test(res.headers.get('content-type'))) return conn.sendFile(m.chat, url, 'file', text, m)
    
    // 3. معالجة البيانات النصية والبرمجية وقراءتها
    let txt = await res.buffer()
    try {
        // محاولة تنسيق البيانات إذا كانت بصيغة JSON لجعلها مريحة وسهلة القراءة
        txt = format(JSON.parse(txt + ''))
    } catch (e) {
        // إذا كانت نصوصاً عادية يتم إبقاؤها كما هي
        txt = txt + ''
    } finally {
        // إرسال النتيجة النهائية إلى الشات مع اقتطاعها برمجياً عند الحد الآمن لتجنب توقف استجابة الواتساب
        m.reply(txt.slice(0, 65536) + '')
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['جلب <الرابط>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باستخدام التعبير النمطي (RegEx) للغتين
handler.command = /^(fetch|get|جلب|احضر)$/i

export default handler
