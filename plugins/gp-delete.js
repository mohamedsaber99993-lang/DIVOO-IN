let handler = async (m, { conn, usedPrefix, command }) => {
	
  // 1. التحقق الاستباقي: إذا لم يقم المشرف بالرد على رسالة معينة لحذفها
  if (!m.quoted) throw `✳️ يرجى الرد (الامتثال) مباشرة على الرسالة التي ترغب في حذفها من المحادثة.`
  
  try {
    // 2. محاولة استخراج المعرفات المتقدمة للرسالة (التشبيك الرقمي الدقيق وسياق النص)
    let delet = m.message.extendedTextMessage.contextInfo.participant
    let bang = m.message.extendedTextMessage.contextInfo.stanzaId
    
    // إرسال حزمة الحذف الرسمية الموجهة لخوادم واتساب
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
    
  } catch {
    // 3. الحل البديل (Fallback): إذا فشل البروتوكول الأول، يتم الحذف عبر مفتاح الرسالة المقتبسة المباشر
    return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['حذف']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = /^del(ete)?|حذف|امسح$/i

// إعدادات القيود والصلابة البرمجية للأمر
handler.group = true      // تعديل هام: تفعيل الأمر داخل المجموعات فقط لأن حذف رسائل الآخرين لا يشتغل في الخاص
handler.admin = true      // قفل حماية: يشترط أن يكون مرسل الأمر مشرفاً في المجموعة
handler.botAdmin = true   // قفل حماية: يشترط أن يكون البوت مشرفاً ليمتلك صلاحية حذف رسائل الأعضاء

export default handler
