import fetch from 'node-fetch'
import axios from 'axios'

let cooldown = 3600000 // مدة وقت الانتظار الإلزامي بالملي ثانية وتساوي ساعة واحدة كاملة

let handler = async (m, { conn, usedPrefix, command }) => {

  // 1. توليد رقم عشوائي صحيح بين 0 و 500 يمثل راتب العمل المكتسب
  let hasil = Math.floor(Math.random() * 500)
  let user = global.db.data.users[m.sender] // جلب بيانات المستخدم من قاعدة البيانات
  
  // 2. التحقق من مؤقت الانتظار: إذا لم تمر ساعة كاملة على آخر عمل، يتم منع المستخدم وعرض الوقت المتبقي
  if (new Date - user.lastwork < cooldown) {
    throw `🧘🏻‍♂️ يمكنك العودة إلى العمل مجدداً بعد: *${msToTime((user.lastwork + cooldown) - new Date())}*`
  }

  // 3. جلب قائمة سيناريوهات وجمل الوظائف العشوائية من المستودع الخارجي عبر الإنترنت
  let anu = (await axios.get('https://raw.githubusercontent.com/fgmods/fg-team/main/games/work.json')).data
  
  // اختيار وظيفة عشوائية من القائمة المستلمة باستخدام دالة pickRandom
  let res = pickRandom(anu)
  
  // إضافة الراتب العشوائي إلى رصيد عملات المستخدم
  user.coin += hasil

  // 4. إرسال نتيجة العمل المترجمة عشوائياً مدمجة مع قيمة العملات المكتسبة باللغة العربية
  m.reply(`
💼 *نتيجة العمل:*
‣ ${res.fgwork} *+${hasil} 🪙*
`, null, fwc)

  // 5. تحديث الطابع الزمني لآخر عملية عمل حية لبدء حساب مؤقت جديد
  user.lastwork = new Date * 1
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['عمل']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['عمل', 'اشتغل', 'وظيفة', 'work', 'w', 'trabajar']

export default handler

/**
 * دالة برمجية مساعدة لتحويل فروق الوقت من الملي ثانية (Milliseconds) إلى صيغة نصية مقروءة (دقائق وثوانٍ)
 * @param {number} duration مدة الوقت بالملي ثانية
 * @returns {string} الوقت المنسق باللغة العربية
 */
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  // إضافة صفر على اليسار إذا كان الرقم أقل من 10 للحفاظ على التنسيق الثنائي (مثال: 05 ثوانٍ)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return minutes + ` دقيقة و ` + seconds + ` ثانية` 
}

/**
 * دالة برمجية لاختيار عنصر واحد بشكل عشوائي تماماً من مصفوفة نصوص معينة
 * @param {Array} list مصفوفة البيانات
 * @returns {any} العنصر المختار عشوائياً
 */
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
