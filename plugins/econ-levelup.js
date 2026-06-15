import { canLevelUp, xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {

  // جلب الاسم الحي للمستخدم من الواتساب
  let name = await conn.getName(m.sender)
  
  // محاولة جلب الصورة الشخصية (Avatar) للمستخدم، وفي حال عدم وجودها يتم تعيين صورة افتراضية
  let pp = await conn.profilePictureUrl(m.sender, 'image')
    .catch(_ => 'https://i.ibb.co/1ZxrXKJ/avatar-contact.jpg')

  let user = global.db.data.users[m.sender] // جلب بيانات حساب المستخدم من الـ Database

  // ──────────────────────────────────────────────────────────
  // [القسم الأول: إذا كان المستخدم لا يملك نقاط كافية لرفع المستوى]
  // ──────────────────────────────────────────────────────────
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {

    // استخراج نطاق ومعدل نقاط الخبرة المطلوبة للمستوى الحالي عبر الدالة المستوردة
    let { min, xp, max } = xpRange(user.level, global.multiplier)

    // صياغة نص تفاصيل المستوى الحالية باللغة العربية
    let txt = `
┌───⊷ *تفاصيل المستوى الحالي 📊*
▢ *الاسم:* ${name}
▢ *المستوى الافتراضي:* [ ${user.level} ]
▢ *الخبرة (XP):* ${user.exp - min} / ${xp}
▢ *الرتبة الحالية:* ${user.role || 'مبتدئ'}
└───────────────────

💡 متبقٍ لك *${max - user.exp} من نقاط الـ XP* للوصول إلى المستوى القادم!
`.trim()

    try {
      // بناء رابط توليد بطاقة رتبة رسومية احترافية عبر الـ API المخصص
      let imgg = API('fgmods', '/api/maker/rank', {
        username: name,
        xp: user.exp - min,
        exp: xp,
        avatar: pp,
        level: user.level,
        ranklog: 'https://i.ibb.co/7gfnyMw/gold.png',
        background: 'https://i.ibb.co/CsNgBYw/qiyana.jpg'
      }, 'apikey')

      // 🔎 التحقق البرمجي من أن السيرفر المزود للبطاقات يعمل حالياً (Ping Check)
      let check = await fetch(imgg)
      if (!check.ok) throw "API تالف أو متوقف مؤقتاً"

      // إرسال بطاقة الترتيب الرسومية مدمجة مع النص العربي المنسق
      await conn.sendFile(m.chat, imgg, 'level.jpg', txt, m)

    } catch (e) {
      // خطة البديل الآمن (Fallback): في حال توقف موقع إنتاج الصور، يتم إرسال بروفايل المستخدم مع النص لضمان عدم تعطل الأمر
      await conn.sendFile(m.chat, pp, 'level.jpg', txt, m)
    }
  }

  // ──────────────────────────────────────────────────────────
  // [القسم الثاني: إذا كان المستخدم يملك نقاطاً كافية ويستحق الترقية]
  // ──────────────────────────────────────────────────────────
  let before = user.level * 1 // حفظ المستوى القديم قبل التعديل للمقارنة

  // تشغيل حلقة فحص تراكمية لزيادة المستويات برمجياً طالما أن نقاطه تسمح بذلك
  while (canLevelUp(user.level, user.exp, global.multiplier))
    user.level++

  // إذا تغير المستوى الفعلي بعد انتهاء الحلقة التكرارية
  if (before !== user.level) {

    // تحديث المسمى الوظيفي أو الرتبة (Role) برمجياً بناءً على القائمة المعتمدة في الملفات الرئيسية
    user.role = global.rpg.role(user.level).name

    // صياغة رسالة التهنئة باللغة العربية بمناسبة رفع المستوى
    let str = `
┌─⊷ *🎉 مبارك! لقد ارتفع مستواك (LEVEL UP) 🎉*
▢ *المستوى السابق:* ${before}
▢ *المستوى الحالي المكتسب:* [ ${user.level} ] 🆙
▢ *الرتبة الجديدة:* ${user.role}
└───────────────────
`.trim()

    try {
      // استدعاء صورة التهنئة الخاصة برفع المستوى من الخادم
      let img = API('fgmods', '/api/maker/levelup', { 
        avatar: pp 
      }, 'apikey')

      let check = await fetch(img)
      if (!check.ok) throw "API تالف أو متوقف مؤقتاً"

      // إرسال صورة رفع المستوى مع نص التهنئة
      await conn.sendFile(m.chat, img, 'levelup.jpg', str, m)

    } catch (e) {
      // بديل آمن: إرسال التهنئة كنص صريح في حال واجه خادم الصور مشكلة
      await m.reply(str)
    }
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['مستواي', 'ترقيتي']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الكلمات المفتاحية التي يستجيب لها البوت باللغتين العربية والإنجليزية
handler.command = ['مستوى', 'مستواي', 'رتبتي', 'لفل', 'nivel', 'lvl', 'levelup', 'level']

export default handler
