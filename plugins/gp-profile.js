import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn, usedPrefix, command }) => {

  // 1. تحديد الحساب المستهدف: إما الشخص المقتبس رسالته، المنشن، أو مرسل الأمر نفسه
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  
  // حماية التحقق: إذا كان الحساب غير مسجل إطلاقاً في قاعدة بيانات البوت
  if (!(who in global.db.data.users)) throw `✳️ عذراً، هذا المستخدم غير مسجل في قاعدة البيانات الخاصة بي.`
  
  // جلب الصورة الشخصية للمستخدم، وفي حال عدم وجودها يتم تعويضها بالخلفية الافتراضية
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
  let user = global.db.data.users[who]
  
  // تفكيك واستخراج المتغيرات الشخصية والمالية للاعب من قاعدة البيانات
  let { name, exp, diamond, lastclaim, registered, regTime, age, level, role, warn, genero, prem, coin, bank } = global.db.data.users[who]
  
  // حساب مستويات نقاط الخبرة (XP) المطلوبة للفل القادم بناءً على مستوى المستخدم الحالي
  let { min, xp, max } = xpRange(user.level, global.multiplier)
  let username = await conn.getName(who)
  let math = max - xp // حساب النقاط المتبقية بدقة للترقية
  
  // فحص حالة العضوية الفخمة (Premium)
  let premG = global.prems.includes(who.split`@`[0]) || prem
  let sn = createHash('md5').update(who).digest('hex')

  // 2. صياغة بطاقة الملف الشخصي (لوحة التحكم) باللغة العربية وتنسيقها بعناية
  let str = `
┌───「 *👤 الملف الشخصي (PROFILE)* 」
▢ *🔖 الاسم:* • ${username} ${registered ? '\n   • الاسم المسجل: ' + name + ' ' : ''}
   • @${who.replace(/@.+/, '')}
▢ *🔗 رابط الحساب:* wa.me/${who.split`@`[0]}${registered ? `\n▢ *🎈 العمر:* ${age} سنة\n▢ *🧬 الجنس:* ${genero}` : ''}
▢ *🪙 العملات (الرصيد):* ${bank.toLocaleString()} عملة
▢ *💎 الألماس:* ${diamond.toLocaleString()}
▢ *🆙 المستوى (Level):* [ ${level} ]
▢ *⬆️ نقاط الخبرة (XP):* الإجمالي ${exp} (${user.exp - min} / ${xp})
   • ${math <= 0 ? `مستعد للترقية! اكتب الآن: *${usedPrefix}levelup*` : `متبقٍ لك *[ ${math} xp ]* للوصول للمستوى القادم.`}
▢ *🏆 الرتبة الحاليّة:* ${role}
▢ *📇 حالة التسجيل:* ${registered ? '✅ مسجل': '❎ غير مسجل'}
▢ *🎟️ الحساب الفخم (Premium):* ${premG ? '✅ نعم' : '❎ لا'}
└──────────────`

    // 3. إرسال الصورة الشخصية للمستخدم مرفقة بنص الهوية الشخصية المترجم بالكامل
    conn.sendFile(m.chat, pp, 'perfil.jpg', str, m, false, { mentions: [who] })
    
    // وضع تفاعل (إيموجي) تلقائي على رسالة المستخدم للإشارة إلى إتمام الأمر
    if (global.done) m.react(done)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['بروفايل @العضو']
handler.tags = ['معلومات الحساب / الجروب']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['بروفايل', 'ملفي', 'الحساب', 'profile', 'perfil']

export default handler
