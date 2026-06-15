let cooldown = 14400000 // مدة وقت الانتظار الإلزامي بالملي ثانية وتساوي 4 ساعات كاملة

let handler = async (m, { conn }) => {

  // 1. توليد رقم عشوائي صحيح بين 0 و 500 يمثل كمية العملات المستخرجة من المنجم
  let hasil = Math.floor(Math.random() * 500)
  let user = global.db.data.users[m.sender] // جلب بيانات المستخدم من قاعدة البيانات
  
  // 2. التحقق من مؤقت الانتظار: إذا لم تمر 4 ساعات على آخر عملية تعدين، يتم منع المستخدم وعرض الوقت المتبقي له
  if (new Date - user.lastmiming < cooldown) {
    throw `⏳ _عذراً، يمكنك العودة إلى المنجم مجدداً بعد:_ *${msToTime((user.lastmiming + cooldown) - new Date())}*`
  }
  
  // 3. إضافة العملات الناتجة عن التعدين إلى رصيد محفظة المستخدم
  user.coin += hasil
  
  // 4. إرسال رسالة النجاح والتهنئة باللغة العربية
  m.reply(`
🎉 *رائع جداً! لقد نجحت في التعدين*

*العملات المستخرجة:* +${hasil.toLocaleString()} 🪙`, null, fwc)
  
  // 5. تحديث الطابع الزمني لآخر عملية تعدين حية ليتم الحساب بناءً عليه في المرة القادمة
  user.lastmiming = new Date * 1
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تعدين']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['تعدين', 'احفر', 'منجم', 'minar', 'miming', 'mine'] 

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

  // إضافة صفر على اليسار إذا كان الرقم أقل من 10 للحفاظ على التنسيق الثنائي (مثال: 02 ساعة)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + ` ساعة و ` + minutes + ` دقيقة`
}
