import cp from 'child_process'
import { promisify } from 'util'
let exec = promisify(cp.exec).bind(cp)

let handler = async (m, { conn, usedPrefix, command }) => {
    // وضع تفاعل تلقائي (إيموجي الانتظار) على رسالة المستخدم
    m.react(rwait) 
    let o
    try {
        // 1. تنفيذ أمر الفحص عبر بايثون وجلب رابط المشاركة الآمن
        o = await exec('python3 speed.py --share --secure')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        
        // 2. إذا نجح الفحص، يتم عرض النتيجة مع تحديث حالة مؤشر التحميل التلقائي (loadingMsg)
        if (stdout.trim()) {
            conn.loadingMsg(
                m.chat, 
                'جاري قياس السرعة وبث البيانات...', 
                `*≡ نتائج فحص السرعة (SPEEDTEST.NET)*\n\n${stdout}`, 
                ['⟳', '↻', '⟲', '⟳', '↻', '⟲'], 
                m
            )
        } 
        
        // 3. في حال حدوث خطأ في السيرفر أثناء الفحص، يتم إرسال تقرير الخطأ
        if (stderr.trim()) m.reply(stderr, null, fwc)
        
        // وضع تفاعل تلقائي (إيموجي الإتمام) للإشارة إلى نهاية الفحص
        m.react(done) 
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['فحص_السرعة']
handler.tags = ['الرئيسية والمعلومات']

// التعبير النمطي للمصفوفة البرمجية لدعم الكلمات العربية والإنجليزية بالتبادل
handler.command = /^(speedtest|testspeed|فحص_النت|سرعة_النت|السرعه)$/i

export default handler
