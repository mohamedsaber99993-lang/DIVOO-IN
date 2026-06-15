import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {

  // 1. كشط وجلب بيانات جميع المستخدمين من قاعدة البيانات وتحويلها لمصفوفة مدعومة بالقيم الافتراضية
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    exp: data.exp || 0,
    coin: data.coin || 0,
    bank: data.bank || 0,
    diamond: data.diamond || 0,
    level: data.level || 0
  }))

  // تحديد عدد المتصدرين المطلوب عرضهم (افتراضياً 5، والحد الأقصى المسموح به 50 لاعب من خلال المتغير args[0])
  let len = args[0] ? Math.min(50, Math.max(parseInt(args[0]), 5)) : 5

  // 2. فرز المستخدمين برمجياً تلو الآخر تنازلياً (من الأكثر إلى الأقل) واقتطاع العدد المطلوب للعرض
  let topBank = [...users].sort((a,b) => b.bank - a.bank).slice(0, len)
  let topDiamond = [...users].sort((a,b) => b.diamond - a.diamond).slice(0, len)
  let topLevel = [...users].sort((a,b) => b.level - a.level).slice(0, len)

  // 3. حساب الترتيب والمركز الحالي للشخص الذي أرسل الأمر مقارنة بالجميع
  let rankBank = users.sort((a,b) => b.bank - a.bank).findIndex(v => areJidsSameUser(v.jid, m.sender)) + 1
  let rankDiamond = users.sort((a,b) => b.diamond - a.diamond).findIndex(v => areJidsSameUser(v.jid, m.sender)) + 1
  let rankLevel = users.sort((a,b) => b.level - a.level).findIndex(v => areJidsSameUser(v.jid, m.sender)) + 1

  // 4. صياغة وهيكلة لوحة الصدارة باللغة العربية بشكل منسق واحترافي
  let text = `_🔄 تاريخ إعادة تعيين لوحة الصدارة: 01/01/2027_

🏆 *قائمة صدارة المتصدرين* 🏆
━━━━━━━━━━━━━━━━━━━━━━

📊 *أغنى اللاعبين بالعملات النقدية (Coins) 🪙*
← ترتيبك الحالي: الحائز على المركز *[ ${rankBank} ]* من أصل *${users.length}* لاعب.

${topBank.map((u, i) => `*${i + 1}.* @${u.jid.split('@')[0]} ➭ _${u.bank.toLocaleString()}_ 🪙`).join('\n')}

👑 *أقوى اللاعبين برصيد الألماس 💎*
← ترتيبك الحالي: الحائز على المركز *[ ${rankDiamond} ]* من أصل *${users.length}* لاعب.

${topDiamond.map((u, i) => `*${i + 1}.* @${u.jid.split('@')[0]} ➭ _${u.diamond.toLocaleString()}_ 💎`).join('\n')}

📈 *أعلى اللاعبين مستواً (Level) ⬆️*
← ترتيبك الحالي: الحائز على المركز *[ ${rankLevel} ]* من أصل *${users.length}* لاعب.

${topLevel.map((u, i) => `*${i + 1}.* @${u.jid.split('@')[0]} ➭ _المستوى ${u.level}_`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━`.trim()

  // 5. جمع معرفات جميع المتصدرين في مصفوفة واحدة فريدة لمنع التكرار لعمل تاغات ذكية لهم في الرسالة
  let mentions = [...new Set([
    ...topBank.map(u => u.jid),
    ...topDiamond.map(u => u.jid),
    ...topLevel.map(u => u.jid)
  ])]

  // إرسال لوحة الصدارة العربية مع تفعيل المنشن التلقائي
  await conn.reply(m.chat, text, m, { mentions })

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['لوحة_الصدارة']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['الصدارة', 'المتصدرين', 'التوب', 'leaderboard', 'lb', 'top']

export default handler
