let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let who
  // تحديد هوية المستخدم المستهدف: سواء عبر المنشن في المجموعات، أو الرد على رسالته، أو في الخاص
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  else who = m.chat

    let user = global.db.data.users[who]
    // التحقق من تحديد المستخدم
    if (!who) throw `✳️ يرجى عمل منشن (@) للمستخدم المستهدف.`
    // التحقق من وجود المستخدم في قاعدة البيانات لتفادي أخطاء القراءة الحركية
    if (!(who in global.db.data.users)) throw `✳️ هذا المستخدم غير مسجل في قاعدة بيانات البوت.`
    
  // استخلاص القيمة الرقمية المكتوبة بعد المنشن وتنظيف النص
  let txt = text.replace('@' + who.split`@`[0], '').trim() 
  
  // إذا لم يتم كتابة عدد النقاط، يتم عرض شرح لطريقة الاستخدام الصحيحة
  if (!txt) return m.reply(`✳️ طريقة استخدام الأمر:\n\n📌 مثال: *${usedPrefix + command}* @${m.sender.split`@`[0]} 20`, null, { mentions: [m.sender] }) 
  if (isNaN(txt)) throw `🔢 خطأ: يرجى إدخال أرقام فقط وليس نصوصاً.`
  
  let adx = parseInt(txt) // تحويل النص إلى رقم صحيح
  if (adx < 1) throw '✳️ الحد الأدنى للعملية هو *1*'
  let users = global.db.data.users 
  
 let type = (command).toLowerCase()
 
 // محرك التبديل (Switch Case) للتحكم في نوع العملة أو الخصائص المطلوبة بناءً على الأمر المستخدم
switch (type) {
  // --- [قسم إضافة نقاط الخبرة XP] ---
  case 'addxp':
  case 'add-xp':
  users[who].exp += adx
  await m.reply(`≡ *تم إضافة نقاط خبرة (XP) 🆙*
┌───────────────────
▢ *الكمية المضافة:* +${adx}
└───────────────────`)
 conn.fakeReply(m.chat, `▢ لقد تلقيت للتو \n\n *+${adx} XP*`, who, m.text)
 break
 
  // --- [قسم إضافة العملات النقدية Coins] ---
 case 'addcoin':
  users[who].bank += adx
  await m.reply(`≡ *تم إضافة عملات نقدية 🪙*
┌───────────────────
▢ *الالكمية المضافة:* +${adx}
└───────────────────`)
 conn.fakeReply(m.chat, `▢ لقد تلقيت للتو \n\n *+${adx} عملة (Coins)*`, who, m.text)
 break 
 
  // --- [قسم إضافة الألماس Diamond] ---
 case 'adddi':
 case 'add-di':
 case 'adddiamond':
  users[who].diamond += adx
  await m.reply(`≡ *تم إضافة ألماس 💎*
┌───────────────────
▢ *الكمية المضافة:* +${adx}
└───────────────────`)
 conn.fakeReply(m.chat, `▢ لقد تلقيت للتو \n\n *+${adx} ماسة (Diamonds)*`, who, m.text)
 break
 
  // --- [قسم خصم/إزالة نقاط الخبرة XP] ---
 case 'delxp':
 case 'removexp':
 case 'del-xp':
  if (user.exp < adx) return m.reply(`❇️ المستخدم @${who.split`@`[0]} لا يملك رصيداً كافياً من الـ XP لخصم [${adx}]`, null, { mentions: [who] })
   users[who].exp -= adx 
  await m.reply(`≡ *تم خصم نقاط خبرة (XP) 📉*
┌───────────────────
▢ *الكمية المخصومة:* -${adx}
└───────────────────`)
 break 
 
  // --- [قسم خصم/إزالة العملات النقدية Coins] ---
 case 'delcoin':
   users[who].bank -= adx 
  await m.reply(`≡ *تم خصم عملات نقدية 🪙*
┌───────────────────
▢ *الكمية المخصومة:* -${adx}
└───────────────────`)
 break
 
  // --- [قسم خصم/إزالة الألماس Diamond] ---
 case 'deldi':
 case 'removedi':
 case 'del-di':
  if (user.diamond < adx) return m.reply(`❇️ المستخدم @${who.split`@`[0]} لا يملك رصيداً كافياً من الألماس لخصم [${adx}]`, null, { mentions: [who] })
  users[who].diamond -= adx 
  await m.reply(`≡ *تم خصم ألماس 💎*
┌───────────────────
▢ *الكمية المخصومة:* -${adx}
└───────────────────`)
 break 
 
  // --- [قسم رفع المستوى Level] ---
 case 'addlvl':
  users[who].level += adx 
  await m.reply(`≡ *تم رفع المستوى ⬆️*
┌───────────────────
▢ *المستويات المضافة:* +${adx}
└───────────────────`)
 break 

  // --- [قسم خفض المستوى Level] ---
 case 'removelvl':
  if (user.level < adx) return m.reply(`❇️ المستخدم @${who.split`@`[0]} مستواه الحالي أقل من [${adx}] مستويات لخفضه.`, null, { mentions: [who] })
  users[who].level -= adx 
  await m.reply(`≡ *تم خفض المستوى ⬇️*
┌───────────────────
▢ *المستويات المخصومة:* -${adx}
└───────────────────`)
 break 
 
 default:
 }
 
}

// السجل المنظم لجميع الكلمات والأوامر الفرعية المدعومة والمطابقة للتعبيرات النمطية
handler.command = /^(delcoin|addcoin|addxp|add-xp|adddi|add-di|adddiamond|delxp|del-xp|del-di|deldi|removexp|removedi|addlvl|removelvl)$/i

// قفل حماية صارم: لضمان أن مطور البوت الأساسي فقط من يتحكم بالاقتصاد لمنع التلاعب برتب البوت
handler.rowner = true

export default handler
