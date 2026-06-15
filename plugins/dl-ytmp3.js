import fetch from 'node-fetch'
import fg from 'fg-senna' 

let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
    
    // 1. التحقق من وجود الرابط وإدخاله بجانب الأمر
    if (!args || !args[0]) throw `✳️ يرجى إدخال رابط مقطع فيديو من يوتيوب (YouTube).\n\n📌 مثال على الاستخدام :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`
    
    // 2. التحقق الأولي للتأكد من أن الرابط يخص منصة يوتيوب فعلياً
    if (!args[0].match(/youtu/gi)) throw `❎ عذراً، يرجى التأكد من أن الرابط الذي أدخلته هو رابط يوتيوب صحيح.`
    
    let chat = global.db.data.chats[m.chat]
    
    // إظهار تفاعل الانتظار (جاري التحميل وتحويل الصوت)
    m.react(rwait)  
    
    try {
        // 3. استدعاء دالة ytv من مكتبة fg-senna وسحب الصوت بجودة أساسية موفرة ومستقرة 240p لضمان سرعة التحويل
        let res = await fg.ytv(args[0], "240p")

        // تفكيك كائن البيانات المستخرج من اليوتيوب
        let { title, dl_url, thumb, size, sizeB, duration, quality } = res

        // 4. إرسال الملف الصوتي الناتج بصيغة mpeg وتحديد آلية الإرسال (صوت أو وثيقة) بناءً على إعدادات المحادثة المسبقة
        await conn.sendFile(m.chat, dl_url, title + '.mp3', `
≡ *تحميل صوتيات يوتيوب 🎧*
  
▢ *📌 العنوان:* ${title}
`.trim(), m, false, { 
            mimetype: 'audio/mpeg', 
            asDocument: chat.useDocument 
        })
        
        // إظهار تفاعل النجاح واكتمال إرسال الأوديو
        m.react(done) 
        
    } catch (e) {
        // التعامل الآمن مع الأخطاء في حال كان الرابط محظوراً أو الفيديو غير متوفر
        console.error(e)
        await m.reply(`❎ حدث خطأ غير متوقع أثناء محاولة تحميل وتحويل المقطع، يرجى المحاولة لاحقاً.`)
    } 
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['يوتيوب_صوت'].map(v => v + ' <الرابط>')
handler.tags = ['التحميلات / الميديا']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['يوتيوب_صوت', 'صوت', 'تحميل_صوت', 'ytmp3', 'fgmp3'] 
handler.diamond = false // جعل الأمر مجانياً بالكامل ولا يستهلك نقاط الألماس

export default handler
