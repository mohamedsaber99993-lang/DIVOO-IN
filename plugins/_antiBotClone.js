import { areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { participants, conn }) {
    // التحقق مما إذا كان الأمر يحدث داخل مجموعة (Group)
    if (m.isGroup) {
        let chat = global.db.data.chats[m.chat];
        
        // إذا كانت ميزة "منع البوتات المستنسخة" معطلة في هذه المجموعة، يتم إيقاف الدالة
        if (!chat.antiBotClone) {
            return
        }

        let botJid = global.conn.user.jid // معرف (JID) الخاص بالبوت الرئيسي للمشروع

        // إذا كان البوت الحالي الذي ينفذ الكود هو نفسه البوت الرئيسي، فلا يفعل شيئاً ويستمر في المجموعة
        if (botJid === conn.user.jid) {
            return
        } else {
            // أما إذا كان البوت الحالي "بوت فرعي/مستنسخ"، فيتحقق مما إذا كان البوت الرئيسي متواجداً في نفس المجموعة
            let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id))
            
            // إذا تم العثور على البوت الرئيسي داخل المجموعة
            if (isBotPresent) {
                // الانتظار لمدة 5 ثوانٍ قبل تنفيذ إجراء الخروج لتفادي التداخل في إرسال البيانات
                setTimeout(async () => {
                    // إرسال رسالة توضيحية للمجموعة باللغة العربية
                    await m.reply(`✨ نظراً لوجود البوت الرئيسي في هذا الجروب، سأقوم بالمغادرة الآن لتفادي تكرار إرسال الرسائل والسبام.`, null, fwc)
                    
                    // مغادرة المجموعة تلقائياً
                    await this.groupLeave(m.chat)
                }, 5000) // 5 ثوانٍ
            }
        }
    }
}
