import fg from "fg-senna"

let handler = async (m, { conn, text }) => {
    // التحقق مما إذا كان المستخدم قد كتب اسم التطبيق المراد البحث عنه
    if (!text) throw `✳️ يرجى كتابة اسم التطبيق أو اللعبة المراد تحميلها.\nمثال: .apk whatsapp`

    try {
        // البدء في البحث عن التطبيق باستخدام دالة apks المتوفرة في المكتبة
        let res = await fg.apks(text)
        
        // التحقق مما إذا كانت نتائج البحث فارغة
        if (!res || res.length === 0) throw '❌ لم يتم العثور على التطبيق المطلوب.'
        
        // استخراج بيانات أول تطبيق يظهر في نتائج البحث (الأكثر مطابقة)
        let { name, developer, icon, dl_apk, date } = res[0]

        // إظهار تفاعل الانتظار (جاري التحميل)
        m.react(rwait)
        
        // صياغة النص التوضيحي للتطبيق باللغة العربية
        let caption = `
*📌 اسم التطبيق:* ${name}
*👨‍💻 المطور:* ${developer || 'غير معروف'}
*🔼 تاريخ التحديث:* ${date}`

        // 1. إرسال أيقونة التطبيق أولاً مع النص التوضيحي
        await conn.sendFile(m.chat, icon, 'icon.png', caption, m, null, fwc)

        // 2. إرسال ملف الـ APK الفعلي وتعيين نوع الـ Mimetype ليتعرف عليه الهاتف كملف تثبيت أندرويد
        await conn.sendFile(m.chat, dl_apk, `${name}.apk`, '', m, null, { 
            mimetype: 'application/vnd.android.package-archive', 
            asDocument: true 
        })
        
        // إظهار تفاعل النجاح (تم الإرسال)
        m.react(done)
        
    } catch (e) {
        // التعامل مع الأخطاء البرمجية أو انقطاع الاتصال بالخادم بشكل آمن
        console.error(e)
        m.reply("❌ حدث خطأ أثناء جلب التطبيق، يرجى المحاولة مرة أخرى لاحقاً.")
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحميل_تطبيق']
handler.tags = ['التحميلات / الميديا']
handler.command = ["تحميل_تطبيق", "تطبيق", "برنامج", "apk", "app"]

export default handler
