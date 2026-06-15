let handler = async (m, { conn, participants, groupMetadata }) => {
    
    // 1. جلب الصورة الشخصية للمجموعة، وفي حال عدم وجودها يتم استخدام الصورة الافتراضية للبوت
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './src/avatar_contact.png'
    
    // استخراج حالات التفعيل والتعطيل للميزات من قاعدة البيانات الخاصة بالمجموعة الحالية
    const { isBanned, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink, nsfw, captcha, useDocument } = global.db.data.chats[m.chat]
    
    // فرز وتحديد الأعضاء الذين يمتلكون رتبة مشرف (Admin)
    const groupAdmins = participants.filter(p => p.admin)
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
    
    // تحديد هوية منشئ ومملك المجموعة الأساسي (Superadmin)
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    
    // 2. صياغة بطاقة معلومات المجموعة باللغة العربية وتنسيقها بصيغة Scannable جذابة
    let text = `
┌──「 *📊 معلومات المجموعة (Group Info)* 」
▢ *♻️ معرف المجموعة (ID):*
   • ${groupMetadata.id} 
▢ *🔖 اسم المجموعة:* • ${groupMetadata.subject}
▢ *👥 عدد الأعضاء الحاليين:* [ ${participants.length} ] عضو.
▢ *👑 مالك ومؤسس المجموعة:*
   • wa.me/${owner.split('@')[0]}
▢ *🕵🏻‍♂️ عدد المشرفين:* [ ${groupAdmins.length} ] مشرف.

🛡️ *حالة إعدادات الأمان والميزات:*
• 📮 الترحيب والوداع (Welcome): ${welcome ? '✅ مُفعّل' : '❎ مُعطّل'}
• ❕ كاشف التغيرات (Detect): ${detect ? '✅ مُفعّل' : '❎ مُعطّل'}
• 🔞 محتوى الكبار (Nsfw): ${nsfw ? '✅ مُفعّل' : '❎ مُعطّل'}
• 🚨 مضاد الروابط (Anti-Link): ${antiLink ? '✅ مُفعّل' : '❎ مُعطّل'}
• 🧬 اختبار التحقق (Captcha): ${captcha ? '✅ مُفعّل' : '❎ مُعطّل'}
• 📑 التعامل بالوثائق (Document): ${useDocument ? '✅ مُفعّل' : '❎ مُعطّل'}

📬 *قوالب رسائل النظام المخصصة:*
• *رسالة الترحيب:* ${sWelcome || 'الافتراضية'}
• *رسالة المغادرة:* ${sBye || 'الافتراضية'}

📝 *وصف المجموعة (Description):*
   • ${groupMetadata.desc?.toString() || 'لا يوجد وصف للمجموعة حالياً.'}
`.trim()

    // 3. إرسال الصورة الشخصية للمجموعة مرفقة بنص المعلومات المنسق بالكامل
    conn.sendFile(m.chat, pp, 'pp.jpg', text, m, null, fwc)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['معلومات_الجروب']
handler.tags = ['إشراف المجموعات']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['معلومات_الجروب', 'المجموعه', 'الجروب', 'infogrupo', 'groupinfo', 'infogp'] 

// قفل الأمان: تشغيل الأمر داخل المجموعات فقط لمنع الانهيار البرمجي في الخاص
handler.group = true

export default handler
