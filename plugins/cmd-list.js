let handler = async (m, { conn }) => {
    // إرسال قائمة الأوامر المرتبطة بالملصقات ومصفاة من قاعدة البيانات باللغة العربية
    conn.reply(m.chat, `
*قائمة الأوامر المرتبطة بالملصقات 📋*

▢ *ملاحظة:* إذا كان الأمر مكتوباً بجانبه (محمي) فهذا يعني أنه مغلق ولا يمكن حذفه.

──────────────────
${Object.entries(global.db.data.sticker).map(([key, value], index) => `${index + 1}. ${value.locked ? `🔒 (محمي) [${key.slice(0, 6)}...]` : `🔓 [${key.slice(0, 6)}...]`} : *${value.text}*`).join('\n')}

`.trim(), null, {
        // جمع وعمل إشارات (Mentions) لجميع المستخدمين المذكورين في تلك الأوامر تلقائياً إن وجدوا
        mentions: Object.values(global.db.data.sticker).map(x => x.mentionedJid).reduce((a, b) => [...a, ...b], [])
    })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['قائمة_اوامر_الملصقات']
handler.tags = ['التحكم / الأوامر']
handler.command = ['قائمة_اوامر_الملصقات', 'اوامر_الملصقات', 'listcmd']

export default handler
