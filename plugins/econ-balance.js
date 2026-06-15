let handler = async (m, { conn, usedPrefix }) => {
	
    // 1. تحديد هوية المستخدم المستهدف: سواء عبر الرد على رسالته، أو المنشن، أو صاحب الأمر نفسه
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let user = global.db.data.users[who]
    
    // التحقق من وجود المستخدم في قاعدة البيانات لتجنب أخطاء القراءة البرمجية
    if (!(who in global.db.data.users)) throw `✳️ عذراً، هذا المستخدم غير مسجل في قاعدة بيانات البوت.`
    
    // 2. صياغة وعرض كشف الحساب والرصيد باللغة العربية
    conn.reply(m.chat, `
 ≡ *الحساب المالي للمستخدم:* @${who.split('@')[0]}

 💰 *المحفظة الشخصية*
┌───⊷
▢ *💎 الألماس:* _${user.diamond.toLocaleString()}_
▢ *🪙 العملات (Coins):* _${user.coin.toLocaleString()}_
└──────────────

 🏦 *البنك المركزي للبوت*
┌───⊷
▢ *🪙 العملات المودعة:* _${user.bank.toLocaleString()}_
└──────────────
`, m, { mentions: [who] })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['رصيدي']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['رصيد', 'رصيدي', 'فلوسي', 'الماس', 'المحفظة', 'bal', 'diamantes', 'diamond', 'balance'] 

export default handler
