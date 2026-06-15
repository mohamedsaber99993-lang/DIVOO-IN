import fg from 'fg-senna'

// إعداد حدود التحميل بالميجابايت (MB) لحماية موارد السيرفر
let free = 150  // الحد الأقصى للمستخدمين العاديين (150 ميجابايت)
let prem = 500  // الحد الأقصى للمستخدمين المميزين/البريميوم (500 ميجابايت)

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems }) => {

    // 1. التحقق من وجود الرابط
    if (!args[0]) throw `✳️ يرجى إدخال رابط ملف جوجل درايف (Google Drive).\nمثال: ${usedPrefix + command} [الرابط]`
    
    // إظهار تفاعل الانتظار (جاري التحميل)
    m.react(rwait) 
	
    try {
        // 2. استدعاء دالة gdrive من مكتبة fg-senna لتحليل الرابط وجلب بيانات الملف
        let res = await fg.gdrive(args[0])

        // 3. تحديد حد التحميل المسموح به بناءً على رتبة المستخدم (مطور، بريميوم، أو عادي)
        let limit = isPrems || isOwner ? prem : free
        
        // التحقق مما إذا كان حجم الملف الفعلي (بالبايت) يتجاوز الحد المسموح به (بعد تحويل الميجابايت إلى بايت)
        let isLimit = res.fileSizeB > limit * 1024 * 1024
        
        // صياغة تفاصيل الملف باللغة العربية
        await m.reply(`
≡ *تحميل من جوجل درايف 📁*

*📌 اسم الملف:* ${res.fileName}
*⚖️ الحجم:* ${res.fileSize}
${isLimit ? `\n▢ ❌ عذراً، هذا الملف يتجاوز الحد الأقصى المسموح به للتحميل وهو *+${free} ميجابايت*. اشترك في العضوية المميزة (Premium) لتتمكن من تحميل ملفات تصل إلى *${prem} ميجابايت*.` : ''} 
`)
		
        // 4. إذا لم يتجاوز الملف الحد المسموح، يتم رفعه وإرساله فوراً كمستند
        if (!isLimit) {
            await conn.sendMessage(m.chat, { 
                document: { url: res.downloadUrl }, 
                fileName: res.fileName, 
                mimetype: res.mimetype 
            }, { quoted: m })
        }
        
        // إظهار تفاعل النجاح واكتمال العملية
        m.react(done)
        
    } catch (e) {
        // التعامل الآمن مع الأخطاء في حال كان الرابط خاصاً أو غير صالح
        console.error(e)
        m.reply("❌ حدث خطأ أثناء محاولة جلب الملف، يرجى التأكد من أن الرابط عام وليس خاصاً.") 
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['جوجل_درايف']
handler.tags = ['التحميلات / الميديا']
handler.command = ['جوجل_درايف', 'درايف', 'gdrive']

handler.diamond = true // استهلاك نقاط الألماس عند تفعيل الأمر

export default handler
