function handler(m, { conn, groupMetadata }) {
	
  // حساب وقت انتهاء فترة الانتظار (8 ساعات من تاريخ آخر استخدام)
  let time = global.db.data.users[m.sender].shipping + 28800000
  
  // 1. التحقق من مؤقت الانتظار: إذا لم تمر 8 ساعات، يتم منع المستخدم وعرض الوقت المتبقي له
  if (new Date - global.db.data.users[m.sender].shipping < 28800000) {
    throw `👩🏻‍❤️‍💋‍👨🏾 يمكنك اختيار ثنائي آخر بعد: *${msToTime(time - new Date())}*`
  }

  // 2. كشط مصفوفة جميع المعرفات (JIDs) للأعضاء المتواجدين في المجموعة حالياً
  let ps = groupMetadata.participants.map(v => v.id)
  
  // اختيار العضو الأول عشوائياً
  let f = ps.getRandom()
  let g
  
  // 3. حلقة تكرارية لاختيار العضو الثاني عشوائياً مع ضمان عدم اختيار نفس الشخص الأول
  do {
    g = ps.getRandom()
  } while (g === f)

  // 4. إرسال النتيجة باللغة العربية مدمجة مع إشارات التاج (Mentions) للثنائي المختار
  m.reply(`
▢ *💞 ثنائي اليوم العشوائي 💞*

${toM(f)}
       ❤️
${toM(g)}
`, null, { mentions: [f, g] })

  // 5. تحديث الطابع الزمني للمستخدم لمنعه من تكرار الأمر قبل مضي 8 ساعات
  global.db.data.users[m.sender].shipping = new Date * 1
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['ثنائي_اليوم']
handler.tags = ['الألعاب والتسلية']

// الكلمة المفتاحية لتشغيل الأمر
handler.command = ['ثنائي', 'كوبل', 'shipping']

// قفل الحماية: تفعيل الأمر للعمل داخل المجموعات (الجروبات) فقط ومنعه في الخاص
handler.group = true

export default handler

/**
 * دالة مساعدة لتشكيل نص المنشن واقتطاع المعرف الرقمي الصافي
 * @param {string} f معرف الواتساب الممرر
 * @returns {string} الرقم مسبوقاً بعلامة @
 */
let toM = f => '@' + f.split('@')[0]

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

  // إضافة صفر على اليسار إذا كان الرقم أقل من 10 للحفاظ على التنسيق الثنائي (مثال: 04 ساعات)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + ` ساعة و ` + minutes + ` دقيقة`
}
