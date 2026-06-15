import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
	
  // 1. تحديد المستخدم المستهدف (الرد على رسالته، المنشن، أو مرسل الأمر نفسه)
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  
  // 2. استدعاء الـ API الخارجي لتطبيق تأثير الاهتزاز والغضب (Canvas Triggered Effect) على صورة البروفايل
  let marah = global.API('https://some-random-api.com', '/canvas/triggered', {
    avatar: await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png'), 
  })

  // 3. تحويل الرابط الناتج عن التأثير مباشرة إلى ملصق واتساب متحرك
  let stiker = await sticker(false, marah, global.packname, global.author)
  
  // 4. إرسال الملصق المتحرك بنجاح إلى الدردشة
  if (stiker) return await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m)
  
  throw stiker.toString()
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['غضب @المستخدم']
handler.tags = ['قسم الملصقات (Stickers)']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['trigger', 'triggered', 'ger', 'غضب', 'منفعل', 'اهتزاز'] 

export default handler
