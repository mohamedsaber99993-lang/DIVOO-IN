import { canLevelUp } from '../lib/levelling.js'

export async function before(m, { conn }) {
    let user = global.db.data.users[m.sender]
    
    // إذا كان المستخدم معطلاً لميزة الترقية التلقائية، يتم إيقاف الدالة فوراً
    if (!user.autolevelup)
        return !0
        
    let before = user.level * 1 // تخزين مستوى المستخدم الحالي قبل الفحص
    
    // حلقة تكرارية للتحقق مما إذا كانت نقاط الخبرة (XP) الحالية تؤهله للصعود لمستويات أعلى
    while (canLevelUp(user.level, user.exp, global.multiplier))
        user.level++
        
    // تحديث اللقب أو الرتبة (Role) الخاصة بالمستخدم بناءً على مستواه الجديد
    user.role = global.rpg.role(user.level).name
    
    // إذا تغير مستوى المستخدم (أي صعد بالفعل)، يتم إرسال رسالة التهنئة باللغة العربية
    if (before !== user.level) {
        m.reply(`
*▢ تهانينا! لقد ارتفع مستواك*

 *${before}* ‣ *${user.level}*
 الرتبة الحالية : *${user.role}*
`.trim())
    }
}
