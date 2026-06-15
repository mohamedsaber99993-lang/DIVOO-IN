let free = 1500 // قيمة المكافأة اليومية المجانية (1500 عملة)
let cooldown = 86400000 // مدة وقت الانتظار بالملي ثانية وتساوي 24 ساعة كاملة

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender] // جلب بيانات المستخدم من قاعدة البيانات
  
  // 1. التحقق من مؤقت الانتظار: إذا لم تمر 24 ساعة على آخر مطالبة، يتم إطلاق تنبيه بالوقت المتبقي
  if (new Date - user.lastclaim < cooldown) {
    throw `🎁 لقد استلمت مكافأتك اليومية بالفعل! يرجى العودة بعد: *${msToTime((user.lastclaim + cooldown) - new Date())}*`
  }
  
  // 2. إضافة المكافأة إلى رصيد عملات المستخدم في المحفظة
  user.coin += free
  
  // 3. إرسال رسالة النجاح والتهنئة باللغة العربية
  m.reply(`
🎁 *المكافأة اليومية المجانية*

*العملات المكتسبة:* +${free.toLocaleString()} 🪙`, null, fwc)
  
  // 4. تحديث الطابع الزمني لآخر مطالبة بنجاح ليتم الحساب بناءً عليه في المرة القادمة
  user.lastclaim = new Date * 1
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['يومي']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['يومي', 'راتب', 'المكافأة', 'daily', 'claim'] 

export default handler

/**
 * دالة برمجية مساعدة لتحويل فروق الوقت من الملي ثانية (Milliseconds) إلى صيغة نصية مقروءة (ساعات ودقائق)
 * @param {number} duration مدة الوقت بالملي ثانية
 * @returns {string} الوقت المنسق باللغة العربية
 */
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  // إضافة صفر على اليسار إذا كان الرقم أقل من 10 للحفاظ على التنسيق الثنائي (مثال: 05 ساعات)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + ` ساعة و ` + minutes + ` دقيقة`
}
