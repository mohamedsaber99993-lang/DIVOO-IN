let handler = async (m, { conn, groupMetadata }) => { 

  // 1. استدعاء رمز دعوة المجموعة الحركي من خوادم واتساب ودمجه مع الرابط الرسمي
  let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
  
  // 2. إرسال الرابط مدمجاً مع اسم المجموعة باللغة العربية وتفعيل خاصية المعاينة الذكية للرابط
  conn.reply(m.chat, `\nرابط الدعوة الخاص بمجموعة: *${groupMetadata.subject}*\n\n${link}`, m, { detectLink: true })

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['رابط_المجموعة']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['رابط', 'الرابط', 'رابط_الجروب', 'linkgroup', 'link'] 

// أقفال الحماية والصلابة البرمجية للأمر
handler.group = true       // يعمل هذا الأمر داخل المجموعات (الجروبات) فقط لمنع انهياره في الخاص
handler.botAdmin = true    // يشترط أن يكون البوت مشرفاً ليمتلك صلاحية جلب رمز الدعوة من النظام

export default handler
