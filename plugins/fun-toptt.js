import { toPTT } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // تحديد مكان الوسائط المستهدفة: سواء كانت رسالة مقتبسة (الرد) أو الرسالة الحالية
        let q = m.quoted ? m.quoted : m
        let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
        
        // 1. تحميل ملف الميديا (صوت أو فيديو) من خوادم واتساب مؤقتاً في الذاكرة
        let media = await q.download?.()
        if (!media) throw '❎ خطأ: فشل تحميل ملف الوسائط من خادم واتساب.'
        
        // 2. تحويل الميديا المستخرجة إلى صيغة بصمة صوتية مخصصة (PTT)
        let audio = await toPTT(media, 'mp4')
        if (!audio.data) throw '❎ خطأ: فشل تحويل الملف الصوتي.'
        
        // 3. إرسال البصمة الصوتية الجديدة إلى المحادثة مع تفعيل خيار العرض كـ ريكورد حي
        conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, true, { mimetype: 'audio/mp4' })
        
    } catch (e) {
        // رسالة التوجيه والخطأ باللغة العربية في حال لم يقم المستخدم بالرد على صوت
        m.reply(`✳️ يرجى الرد على المقطع الصوتي أو الفيديو الذي تريد تحويله إلى بصمة (ريكورد) باستخدام الأمر:\n *${usedPrefix + command}*`)
   }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحويل_لصوت']
handler.tags = ['أدوات وتحويلات الميديا']

// مصفوفة الكلمات المفتاحية التي يستجيب لها البوت باللغتين العربية والإنجليزية
handler.command = ['لصوت', 'لريكورد', 'بصمة', 'toav', 'tovn'] 

export default handler
