let handler = async (m, { conn, text }) => {
  let id = m.chat
  conn.math = conn.math ? conn.math : {}
  
  // إذا كانت هناك عملية حسابية معلقة أو مؤقت نشط لنفس المستخدم، يتم إلغاؤه لتجنب التداخل
  if (id in conn.math) {
    clearTimeout(conn.math[id][3])
    delete conn.math[id]
    m.reply('.... ')
  }
  
  // 1. تنظيف وتصفية النص المدخل برمجياً لمنع محاولات حقن الأكواد الخبيثة وحفظ الأرقام والرموز الرياضية فقط
  let val = text
    .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π|pi/gi, 'Math.PI')
    .replace(/e/gi, 'Math.E')
    .replace(/\/+/g, '/')
    .replace(/\++/g, '+')
    .replace(/-+/g, '-')
    
  // إعادة تنسيق الرموز لشكلها الرياضي المألوف عند عرض النتيجة للمستخدم
  let format = val
    .replace(/Math\.PI/g, 'π')
    .replace(/Math\.E/g, 'e')
    .replace(/\//g, '÷')
    .replace(/\*×/g, '×')
    
  try {
    console.log(val)
    // 2. معالجة وحساب المعادلة الرياضية ديناميكياً
    let result = (new Function('return ' + val))()
    if (!result && result !== 0) throw result
    
    // 3. إرسال النتيجة النهائية باللغة العربية
    m.reply(`*${format}* = _${result}_`)
    
  } catch (e) {
    // 4. إدارة الأخطاء وإرسال التنبيهات وإرشادات الاستخدام باللغة العربية
    if (e == undefined) throw '✳️ يرجى إدخال المعادلة الرياضية المراد حسابها.\n\nالرموز المدعومة هي: -, +, *, /, ×, ÷, π, e, (, )'
    throw '❌ صيغة المعادلة غير صحيحة! يمكنك استخدام الأرقام من 0-9 والرموز التالية فقط: -, +, *, /, ×, ÷, π, e, (, )'
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['احسب <المعادلة>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['cal', 'calc', 'calcular', 'calculadora', 'احسب', 'حاسبة', 'آلة_حاسبة'] 

export default handler
