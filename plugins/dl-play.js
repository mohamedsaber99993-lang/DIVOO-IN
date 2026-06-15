import yts from 'yt-search'
import fg from 'fg-senna'

let limit = 320 // الحد الأقصى لحجم ملفات التحميل بالميجابايت (320 ميجابايت)
let confirmation = {} // كائن مؤقت لحفظ جلسات التحميل بانتظار اختيار المستخدم

let handler = async (m, { conn, args, text, usedPrefix, command }) => {

    // 1. التحقق من إدخال نص البحث
    if (!text) throw `✳️ يرجى كتابة اسم الأغنية أو مقطع الفيديو المراد البحث عنه.\nمثال: ${usedPrefix + command} سورة البقرة`

    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let chat = global.db.data.chats[m.chat];

    // 2. تشغيل محرك البحث في اليوتيوب واختيار أول فيديو يظهر في النتائج
    let res = await yts(text)
    let vid = res.videos[0]

    // إذا لم يعثر المحرك على نتائج
    if (!vid) throw `❎ عذراً، لم يتم العثور على مقطع الفيديو المطلوب.`

    let { title, thumbnail, url, timestamp, views, ago } = vid

    // إظهار تفاعل سماعة الرأس (جاري تحضير القائمة)
    m.react('🎧')

    // 3. صياغة وعرض واجهة الاختيار والمعلومات باللغة العربية
    let msg = `≡ *بحث وتشغيل يوتيوب 🎵*
┌───────────────────
▢ 📌 *العنوان:* ${title}
▢ 📆 *تاريخ الرفع:* ${ago}
▢ ⌚ *المدة الزمنية:* ${timestamp}
▢ 👀 *عدد المشاهدات:* ${views.toLocaleString()}
└───────────────────

قم بالرد على هذه الرسالة بكتابة الرقم المناسب لطلبك:

*1* = تحميل كملف صوتي (MP3) 🎧
*2* = تحميل كمقطع فيديو (MP4) 🎬
`

    // إرسال صورة غلاف المقطع (Thumbnail) مدمجاً معها نص الخيارات
    await conn.sendFile(m.chat, thumbnail, "play.jpg", msg, m)

    // 4. حفظ بيانات الجلسة مؤقتاً في الذاكرة لربطها برقم رد المستخدم لاحقاً
    confirmation[m.sender] = {
        sender: m.sender,
        to: who,
        url: url, 
        chat: chat, 
        timeout: setTimeout(() => {
            // حذف الجلسة تلقائياً بعد مرور دقيقة كاملة إذا لم يقم المستخدم بالرد
            delete confirmation[m.sender];
            // يمكنك إلغاء التعليق عن السطر التالي إذا كنت تريد تنبيه المستخدم بانتهاء الوقت
            // conn.reply(m.chat, `⏳ انتهت المهلة المحددة للاختيار، يرجى إرسال الأمر مجدداً.`, m);
        }, 60000), // وقت الانتظار: 60 ثانية (دقيقة واحدة)
    };
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تشغيل']
handler.tags = ['التحميلات / الميديا']
handler.command = ['تشغيل', 'شغل', 'play', 'playvid']

export default handler

/**
 * معالج الاستماع الاستباقي (Before Listener):
 * وظيفته التقاط ردود الأفعال والرسائل الرقمية قبل تمريرها للأوامر العادية
 */
handler.before = async m => {
    if (m.isBaileys) return; // تجاهل الرسائل الصادرة من البوت نفسه لتفادي اللوب اللانهائي
    if (!(m.sender in confirmation)) return; // المتابعة فقط إذا كان لهذا المستخدم جلسة تحميل معلقة بانتظار رقم الاختيار

    let { sender, timeout, url, chat } = confirmation[m.sender]; // استخراج بيانات الجلسة المربوطة بالمستخدم
    
    // [الخيار الأول: إذا قام المستخدم بكتابة ورد بالرقم 1 - تحميل صوت]
    if (m.text.trim() === '1') {
        clearTimeout(timeout); // إيقاف مؤقت العد التنازلي لإلغاء الجلسة
        delete confirmation[m.sender]; // تفريغ الجلسة من الذاكرة لانتهاء الغرض منها

        // طلب جلب المقطع الصوتي بجودة متوافقة من مكتبة fg-senna
        let res = await fg.ytv(url, "240p")
        let { title, dl_url, thumb, size, sizeB, duration, quality } = res
               
        // إرسال الملف الصوتي الناتج بصيغة mpeg وتحديد ما إذا كان يرسل كمستند أو مقطع صوتي حسب إعدادات الجروب
        await conn.sendFile(m.chat, dl_url, title + '.mp3', `▢ *📌 العنوان:* ${title}`.trim(), m, false, { 
            mimetype: 'audio/mpeg', 
            asDocument: chat.useDocument 
        })
        m.react(done) // إظهار تفاعل النجاح واكتمال تحميل الأوديو

    // [الخيار الثاني: إذا قام المستخدم بكتابة ورد بالرقم 2 - تحميل فيديو]
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        // طلب جلب مقطع الفيديو بجودة متوسطة وموفرة للبيانات 480p
        let res = await fg.ytv(url, "480p")
        let { title, dl_url, thumb, size, sizeB, duration, quality } = res
        
        // فحص حجم الملف بالبايت للتأكد من عدم تجاوزه للحد المسموح به في السيرفر
        let isLimit = limit * 1024 * 1024 < sizeB
        
        // إظهار شريط تقدم متحرك (Loading Bar) أثناء معالجة ورفع الفيديو باللغة العربية
        await conn.loadingMsg(m.chat, '📥 جاري التحميل والدفق', ` ${isLimit ? `≡ *تحميل يوتيوب 🎬*\n\n▢ *⚖️ الحجم الفعلي:* ${size}\n\n▢ _❌ عذراً، حجم المقطع يتجاوز الحد الأقصى المسموح به لك وهو_ *+${limit} ميجابايت*` : '✅ اكتمل تحميل الملف وتجهيزه للإرسال!' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m)
         
        // إذا كان الحجم مسموحاً وضمن النطاق الآمن، يتم رفع مقطع الفيديو فوراً للمحادثة
        if (!isLimit) {
            await conn.sendFile(m.chat, dl_url, title + '.mp4', `
≡ *تم تحميل الفيديو بنجاح 🎬*
        
*📌 العنوان:* ${title}
*⚖️ الحجم:* ${size}
`.trim(), m, false, { asDocument: chat.useDocument })
        }
        m.react(done) // إظهار تفاعل النجاح واكتمال رفع الفيديو
    }
}
