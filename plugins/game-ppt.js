let poin = 200      // تكلفة الرهان والحد الأدنى للعب (200 عملة)
let cooldown = 15000 // مدة وقت الانتظار بالملي ثانية وتساوي 15 ثانية

let handler = async (m, { args, usedPrefix, command }) => {

  // 1. التحقق من إدخال الخيار: إذا لم يختر المستخدم حركة، يتم توجيهه للأسلوب الصحيح
  if (!args[0]) {
    throw `✳️ طريقة استخدام الأمر:\n\n${usedPrefix + command} حجر\n${usedPrefix + command} ورقة\n${usedPrefix + command} مقص`
  }

  let text = args[0].toLowerCase()
  let user = global.db.data.users[m.sender] // جلب بيانات المستخدم من قاعدة البيانات

  // حماية قاعدة البيانات: تهيئة مصفوفة الحساب إذا كان المستخدم جديداً
  if (!user) global.db.data.users[m.sender] = { coin: 0, lastppt: 0 }
  if (!user.coin) user.coin = 0
  if (!user.lastppt) user.lastppt = 0

  // 2. التحقق من مؤقت الانتظار: منع التكرار السريع وعرض الثواني المتبقية
  if (new Date - user.lastppt < cooldown) {
    let tiempo = msToTime((user.lastppt + cooldown) - new Date())
    throw `⏳ يرجى الانتظار *${tiempo}* لتتمكن من اللعب مجدداً.`
  }

  // الحماية المالية: منع اللعب إذا كان رصيد المحفظة أقل من رهان اللعبة
  if (user.coin < poin) {
    return m.reply(`❌ عذراً، تحتاج إلى *${poin} 🪙* على الأقل في محفظتك لبدء اللعب.`)
  }

  // مصفوفة الاختيارات المقبولة برمجياً (باللغة العربية)
  let opciones = ['حجر', 'ورقة', 'مقص']
  if (!opciones.includes(text)) {
    throw `✳️ خيارات غير صالحة! اختر أحد الخيارات التالية فقط:\n- حجر\n- ورقة\n- مقص`
  }

  // جعل البوت يختار حركة عشوائية تماماً من المصفوفة
  let bot = opciones[Math.floor(Math.random() * opciones.length)]
  user.lastppt = new Date * 1 // تحديث طابع وقت اللعب فوراً

  let resultado = ''
  let cambio = 0

  // 3. هندسة منطق اللعبة وفحص شروط الفوز والخسارة والتعادل
  if (text === bot) {
    resultado = '🤝 تعادل!'
    cambio = 10 // جائزة ترضية صغيرة عند التعادل
  } else if (
    (text === 'حجر' && bot === 'مقص') ||
    (text === 'مقص' && bot === 'ورقة') ||
    (text === 'ورقة' && bot === 'حجر')
  ) {
    resultado = '🎉 تهانينا، لقد فزت!'
    cambio = poin // ربح قيمة الرهان كاملاً
  } else {
    resultado = '😔 للأسف، لقد خسرت!'
    cambio = -poin // خصم قيمة الرهان من المحفظة
  }

  // تحديث رصيد العملات النهائي في قاعدة البيانات بناءً على النتيجة
  user.coin += cambio

  // 4. إرسال واجهة النتيجة النهائية باللغة العربية
  m.reply(
`🎮 *لعبة: حجر، ورقة، مقص*

👤 *أنت:* ${text}
🤖 *البوت:* ${bot}

📌 *النتيجة:* ${resultado}
💰 *التغير في الرصيد:* ${cambio > 0 ? `+${cambio}` : cambio} 🪙 عملة`
  )
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['لعبة_حجر']
handler.tags = ['الألعاب والتسلية']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['حجر', 'ورقة', 'مقص', 'ppt']

export default handler

/**
 * دالة برمجية مساعدة لتحويل الوقت المتبقي بالملي ثانية إلى ثوانٍ منسقة
 */
function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  if (seconds < 10) seconds = "0" + seconds
  return seconds + " ثانية"
}
