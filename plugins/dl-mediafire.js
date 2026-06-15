import fg from 'fg-senna'
import fetch from 'node-fetch'

// إعداد حدود التحميل بالميجابايت (MB) لحماية موارد السيرفر من الملفات الضخمة
let free = 150 // الحد الأقصى للميغابايت للمستخدمين العاديين (150 ميجابايت)
let prem = 800 // الحد الأقصى للميغابايت للمستخدمين المميزين/المطورين (800 ميجابايت)

let handler = async (m, { conn, args, text, usedPrefix, command, isOwner, isPrems }) => {
	  
    // 1. التحقق من وجود الرابط وصحته
    if (!args[0]) throw `✳️ يرجى إدخال رابط ملف ميديا فاير (MediaFire).`
    if (!args[0].match(/mediafire/gi)) throw `❎ عذراً، الرابط الذي أدخلته ليس رابط ميديا فاير صحيح.`
    
    // إظهار تفاعل الانتظار (جاري التحميل)
    m.react(rwait)

    // 2. تحديد حد التحميل المسموح به بناءً على صلاحيات المرسل (مطور، مميز، أو عادي)
    let limit = isPrems || isOwner ? prem : free
    
    // التأكد من صياغة الرابط بشكل صحيح مع بروتوكول http/https لتجنب مشاكل الفحص
    let u = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
    
    // التقاط صورة مصغرة للموقع (Screenshot) عبر واجهة برمجية لإرفاقها مع الرسالة
    let ss = await (await fetch(global.API('fg_ss', '/api/ssweb', { delay: 1000, url: u }))).buffer()

    try {
        // 3. استدعاء دالة mediafire من مكتبة fg-senna لتحليل الرابط واستخراج بيانات الملف الحية
        let res = await fg.mediafire(args[0])
        let { url, type, filename, ext, aploud, size, sizeB } = res
   
        // التحقق مما إذا كان حجم الملف الفعلي بالبايت (sizeB) يتجاوز الحد المسموح به
        let isLimit = limit * 1024 * 1024 < sizeB
        
        // صياغة تفاصيل الملف ومعلومات التحميل باللغة العربية
        let caption = `
≡ *تحميل من ميديا فاير 📂*

*📌 اسم الملف:* ${filename}
*⚖️ الحجم:* ${size}
*🔼 تاريخ الرفع:* ${aploud}
${isLimit ? `\n▢ ❌ عذراً، حجم الملف يتجاوز الحد الأقصى المسموح به لك وهو *+${free} ميجابايت*. اشترك في العضوية المميزة (Premium) لتتمكن من تحميل ملفات تصل إلى *${prem} ميجابايت*.` : ''} 
`.trim()

        // 4. إرسال صورة الموقع المصغرة (Screenshot) مدمجاً معها النص التوضيحي العربي
        await conn.sendFile(m.chat, ss, 'ssweb.png', caption, m, null, fwc)

        // 5. إذا كان الحجم مسموحاً ولم يتجاوز القفل، يتم إرسال الملف الفعلي فوراً كوثيقة مستند
        if (!isLimit) {
            await conn.sendFile(m.chat, url, filename, '', m, null, { 
                mimetype: ext, 
                asDocument: true 
            })
        }
 
        // إظهار تفاعل النجاح واكتمال العملية
        m.react(done)
        
    } catch (e) {
        // التعامل الآمن مع الأخطاء في حال كان الرابط تالفاً أو تم حذف الملف من المصدر
        console.error(e)
        m.reply("❌ حدث خطأ غير متوقع أثناء محاولة جلب الملف من ميديا فاير.")
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحميل_ميديافاير']
handler.tags = ['التحميلات / الميديا']
handler.command = ['ميديافاير', 'ميديا_فاير', 'mediafire', 'mfire'] 

handler.diamond = true // استهلاك نقاط الألماس عند تفعيل الأمر

export default handler
