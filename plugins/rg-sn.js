import { createHash } from 'crypto'

let handler = async function (m, { conn, text, usedPrefix }) {
    // توليد الرمز التسلسلي الفريد للمستخدم بناءً على معرف حسابه باستخدام تشفير MD5
    const serial = createHash('md5').update(m.sender).digest('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
    
    // إرسال الرمز التسلسلي للمستخدم باللغة العربية مع قالب الرسائل المتقدم (fwc)
    m.reply(`
▢ *الرمز التسلسلي الخاص بك (Serial)*:\n${serial}
`, null, fwc)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['الرقم_التسلسلي']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['nserie', 'sn', 'mysn', 'serial', 'رقمي', 'سيريال', 'الرقم_التسلسلي'] 

// تفعيل قفل التسجيل (يجب أن يكون المستخدم مسجلاً في البوت ليعمل معه الأمر)
handler.register = true

export default handler
