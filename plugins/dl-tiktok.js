import fg from 'fg-senna'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    
    // 1. التحقق من وجود الرابط وإدخاله بجانب الأمر
    if (!args[0]) throw `📌 يرجى إدخال رابط فيديو أو ألبوم صور من تيك توك (TikTok).\n\nمثال: ${usedPrefix + command} https://vm.tiktok.com/ZMYG92bUh/`
    
    // 2. التحقق الأولي عبر التعبير النمطي للتأكد من أن الرابط يخص منصة تيك توك فعلياً
    if (!args[0].match(/tiktok/gi)) throw `❎ عذراً، يرجى التأكد من أن الرابط الذي أدخلته هو رابط تيك توك صحيح.`
    
    // إظهار تفاعل الانتظار (جاري المعالجة والتحميل)
    m.react(rwait)
      
    try {
        // 3. استدعاء دالة tiktok من مكتبة fg-senna لتحليل الرابط واستخراج مصفوفة البيانات
        let data = await fg.tiktok(args[0])

        // [الحالة الأولى: إذا كان الرابط عبارة عن فيديو عادٍ وليس ألبوم صور]
        if (!data.result.images) {
            
            // صياغة وعرض تفاصيل الفيديو وبيانات صاحب الحساب باللغة العربية
            let tex = `
┌─⊷ *تحميل من تيك توك 🎬* ▢ *📌 الاسم المستعار:* ${data.result.author.nickname}
▢ *👤 اسم المستخدم:* ${data.result.author.unique_id}
▢ *⌚ المدة الزمنية:* ${data.result.duration} ثانية
▢ *❤️ الإعجابات:* ${data.result.digg_count.toLocaleString()}
▢ *👀 المشاهدات:* ${data.result.play_count.toLocaleString()}
▢ *📝 الوصف:* ${data.result.title || 'بدون وصف'}
└───────────────────
`
            // إرسال الفيديو النظيف (بدون علامة مائية) مع النص التوضيحي المنسق
            await conn.sendFile(m.chat, data.result.play, 'tiktok.mp4', tex, m, null, fwc);
            m.react(done) // تفاعل النجاح

        // [الحالة الثانية: إذا كان الرابط عبارة عن ألبوم صور متتابعة - Slide Show]
        } else {
            
            // صياغة نص الإحصائيات المختصر للصور
            let cap = `
▢ *❤️ الإعجابات:* ${data.result.digg_count.toLocaleString()}
▢ *📝 الوصف:* ${data.result.title || 'بدون وصف'}
`
            // حلقة تكرارية للمرور على مصفوفة الصور وإرسالها صورة تلو الأخرى بجودتها الأصلية
            for (let ttdl of data.result.images) {
                await conn.sendMessage(m.chat, { image: { url: ttdl }, caption: cap }, { quoted: m })
            }
            
            // إرسال الصوت أو الموسيقى الخلفية (BGM) المصاحبة للألبوم بصيغة صوتية مستقلة
            await conn.sendFile(m.chat, data.result.play, 'tiktok.mp3', '', m, null, { mimetype: 'audio/mp4' })
            m.react(done) // تفاعل النجاح
        }

    } catch (error) {
        // التعامل الآمن مع الأخطاء في حال كان الحساب خاصاً أو الفيديو محذوفاً
        console.error(error)
        m.reply(`Base ❎ حدث خطأ أثناء جلب البيانات من تيك توك، يرجى المحاولة لاحقاً.`)
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تحميل_تيكتوك']
handler.tags = ['التحميلات / الميديا']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['تيكتوك', 'تيك_توك', 'تيك', 'tt', 'tiktok', 'tiktokimg', 'tiktokslide']
handler.diamond = true // استهلاك نقاط الألماس عند تفعيل الأمر

export default handler
