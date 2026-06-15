import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
	
    // 1. التحقق من إدخال اسم المستخدم: إذا لم يكتب المستخدم اسماً بجانب الأمر يتم توجيهه للمثال الصحيح
    if (!args[0]) throw `📌 يرجى إدخال اسم مستخدم حساب إنستغرام المراد البحث عنه.\n\nمثال: ${usedPrefix + command} cristiano` 
    
    try {
        // 2. الاتصال بالواجهة البرمجية (API) وجلب بيانات الحساب بناءً على مفتاح التشغيل (Apikey) الخاص بالبوت
        let pon = await fetch(global.API('fgmods', '/api/search/igstalk', { username: args[0] }, 'apikey'))
        let res = await pon.json()
        
        // التحقق من نجاح جلب البيانات وتواجد النتيجة لتجنب الأخطاء البرمجية
        if (!res.result) throw '❌ لم يتم العثور على هذا الحساب، تأكد من كتابة الاسم بشكل صحيح.'

        // 3. صياغة وعرض معلومات حساب الإنستغرام باللغة العربية
        let te = `
┌──「 *بيانات حساب إنستغرام 📸* 」
▢ *📌 الاسم:* ${res.result.name || 'لا يوجد اسم معلن'} 
▢ *👤 اسم المستخدم:* ${res.result.username}
▢ *👥 المتابعون (Followers):* ${res.result.followers}
▢ *🫂 يتابع (Following):* ${res.result.following}
▢ *📝 السيرة الذاتية (Bio):* ${res.result.description || 'فارغة'}
▢ *🏝️ عدد المنشورات:* ${res.result.posts}
▢ *🔗 رابط الحساب المباشر:* https://instagram.com/${res.result.username.replace(/^@/, '')}
└───────────────────`

        // 4. إرسال الصورة الشخصية للحساب (Profile Picture) مع النص التوضيحي المنسق
        await conn.sendFile(m.chat, res.result.profile, 'igstalk.png', te, m, null, fwc)
        
    } catch (e) {
        // التعامل الآمن مع الأخطاء في حال كان الحساب محذوفاً أو حدثت مشكلة في الخادم
        console.error(e)
        m.reply(`✳️ حدث خطأ أثناء جلب معلومات الحساب، يرجى المحاولة مرة أخرى لاحقاً.`)
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['فحص_إنستا']
handler.tags = ['التحري / الأدوات']
handler.command = ['فحص_إنستا', 'معلومات_إنستا', 'انستا', 'igstalk', 'instagramstalk'] 

export default handler
