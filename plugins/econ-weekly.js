const we = 5000 // قيمة المكافأة الأسبوعية المجانية (5000 عملة)
let cooldown = 604800000 // مدة وقت الانتظار بالملي ثانية وتساوي 7 أيام كاملة (أسبوع)

let handler = async (m, { conn }) => {
	
  let user = global.db.data.users[m.sender] // جلب بيانات المستخدم من قاعدة البيانات
  
  // 1. التحقق من مؤقت الانتظار: إذا لم يمر أسبوع على آخر مطالبة، يتم إطلاق تنبيه بالوقت المتبقي
  if (new Date - user.weekly < cooldown) {
    throw `⏱️ هذه مكافأة أسبوعية 😉. يرجى العودة بعد:\n *${msToTime((user.weekly + cooldown) - new Date())}*`
  }
  
  // 2. إضافة المكافأة إلى رصيد عملات المستخدم في المحفظة
  user.coin += we
  
  // 3. إرسال رسالة النجاح والتهنئة باللغة العربية
  m.reply(`
🎁 *المكافأة الأسبوعية المجانية*

أوه! هل مرت سنة أو أسبوع بالفعل؟ على أية حال، إليك مكافأتك:

🪙 *العملات المكتسبة:* +${we.toLocaleString()}`)
  
  // 4. تحديث الطابع الزمني لآخر مطالبة بنجاح ليتم الحساب بناءً عليه في المرة القادمة
  user.weekly = new Date * 1
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['أسبوعي']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['اسبوعي', 'أسبوعي', 'راتب_أسبوعي', 'weekly', 'semanal'] 

export default handler

/**
 * دالة برمجية مساعدة لتحويل فروق الوقت من الملي ثانية (Milliseconds) إلى صيغة نصية مقروءة (أيام وساعات ودقائق)
 * @param {number} duration مدة الوقت بالملي ثانية
 * @returns {string} الوقت المنسق باللغة العربية
 */
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24), 
    days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365)
    
  // إضافة صفر على اليسار إذا كان الرقم أقل من 10 للحفاظ على التنسيق الثنائي (مثال: 09 ساعات)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds
  days    = (days > 0)  ? days  : 0;

  return days + ` يوم و ` + hours + ` ساعة و ` + minutes + ` دقيقة`
}
