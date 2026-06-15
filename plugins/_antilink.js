// التعبير النمطي (RegEx) المسؤول عن رصد والتقاط روابط مجموعات الواتساب بدقة
const linkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.fromMe) return // تجاهل الرسائل المرسلة من رقم البوت نفسه
    if (m.isBaileys) return // تجاهل الرسائل الصادرة من بوتات أخرى أو نسخ غير رسمية
    if (!m.isGroup) return !1 // إيقاف الدالة إذا لم تكن الرسالة داخل مجموعة
    
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}
    const isGroupLink = linkRegex.exec(m.text)

    // التحقق مما إذا كانت ميزة منع الروابط مفعلة، وهناك رابط مكتشف، والمرسل ليس مشرفاً (Admin)
    if (chat.antiLink && isGroupLink && !isAdmin) {
        if (isBotAdmin) {
            // استخراج رابط المجموعة الحالية لضمان عدم قيام البوت بطرد الأعضاء عند إرسال رابط نفس الجروب
            const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
            if (m.text.includes(linkThisGroup)) return !0
        }
        
        // إرسال رسالة التحذير والطرد باللغة العربية منشن للعضو المخالف
        await conn.reply(m.chat, `*≡ تم رصد رابط مخالف*
            
إرسال روابط المجموعات الأخرى ممنوع هنا!
عذراً *@${m.sender.split('@')[0]}* سيتم طردك الآن من المجموعة. ${isBotAdmin ? '' : '\n\n⚠️ تنبيه: لست مشرفاً (Admin) في هذه المجموعة حالياً، لذلك لا يمكنني طرده تلقائياً.'}`, null, { mentions: [m.sender] } )
        
        // إذا كان البوت مشرفاً في المجموعة وميزة منع الروابط مفعلة
        if (isBotAdmin && chat.antiLink) {
            await conn.sendMessage(m.chat, { delete: m.key }) // حذف رسالة الرابط المخالف فوراً
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove') // طرد العضو المخالف من المجموعة
        } else if (!chat.antiLink) return 
    }  
    return !0
}
