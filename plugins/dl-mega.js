import { File } from 'megajs'
import mime from 'mime-types'

let handler = async (m, { conn, args }) => {
    // 1. التحقق من وجود الرابط: إذا لم يتم إدخال رابط بجانب الأمر يتم إطلاق تنبيه
    if (!args[0]) throw `✳️ يرجى إدخال رابط ملف ميجا (Mega) المراد تحميلة.`
    
    // إظهار تفاعل الانتظار (جاري التحميل)
    m.react(rwait)
	
    try {
        // 2. ربط الرابط بمحرك مكتبة ميجا وتحليل خصائص الملف السحابية
        let file = File.fromURL(args[0])
        file = await file.loadAttributes() // جلب بيانات الملف مثل الاسم والحجم
        
        // 3. تحميل الملف وتحويله إلى ذاكرة تخزين مؤقتة (Buffer) داخل السيرفر
        let data = await file.downloadBuffer()
        
        // 4. استخراج نوع الـ Mimetype المناسب للملف بناءً على اسمه وامتداده لضمان قراءته بشكل صحيح على الهاتف
        let type = mime.contentType(file.name); 
        
        // 5. استدعاء الدالة المساعدة لتحويل حجم الملف من بايتات إلى وحدة قياس مقروءة (MB أو GB)
        let size = formatFileSize(file.size)

        // صياغة تفاصيل تفريغ ملف ميجا باللغة العربية
        let cap = ` 
≡ *تحميل من ميجا ☁️*

*📌 اسم الملف:* ${file.name}
*⚖️ الحجم:* ${size}
`
        // 6. إرسال الملف المستخرج كوثيقة مستند إلى المحادثة مع النص التوضيحي
        await conn.sendFile(m.chat, data, file.name, cap, m, null, { mimetype: type, asDocument: true })
        
        // إظهار تفاعل النجاح واكتمال العملية
        m.react(done)
        
    } catch (e) {
        // التعامل الآمن مع الأخطاء في حال كان الرابط تالفاً أو تم حذف الملف من خوادم ميجا
        console.error(e)
        m.reply(`✳️ حدث خطأ أثناء محاولة جلب وتحميل الملف من ميجا.`)
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحميل_ميجا']
handler.tags = ['التحميلات / الميديا']
handler.command = ['ميجا', 'تحميل_ميجا', 'mega', 'megadl']
handler.premium = false // الأمر متاح مجاناً لجميع المستخدمين وليس حصرياً للبريميوم

export default handler

/**
 * دالة برمجية مساعدة لتحويل حجم الملفات من البايت (Bytes) إلى وحدات مقروءة (كيلوبايت، ميجابايت، أو جيجابايت)
 * @param {number} bytes حجم الملف بالبايت
 * @returns {string} نص الحجم المنسق بالوحدة المناسبة
 */
let formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + " بايت";
  } else if (bytes < 1024 * 1024) {
    const kilobytes = Math.round(bytes / 1024);
    return kilobytes + " كيلوبايت (KB)";
  } else if (bytes < 1024 * 1024 * 1024) {
    const megabytes = (bytes / (1024 * 1024)).toFixed(2);
    return megabytes + " ميجابايت (MB)";
  } else {
    const gigabytes = (bytes / (1024 * 1024 * 1024)).toFixed(2);
    return gigabytes + " جيجابايت (GB)";
  }
};
