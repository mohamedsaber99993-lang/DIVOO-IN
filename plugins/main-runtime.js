let handler = async (m, { conn, args, usedPrefix, command }) => {
	
    let _muptime
    // 1. استدعاء مدة التشغيل من معالج السيرفر الأساسي (Process Uptime)
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    
    // تمرير الوقت المستلم إلى دالة التنسيق الزمنية
    let muptime = clockString(_muptime)
    
    // 2. إرسال النتيجة النهائية باللغة العربية مع قالب اقتباس الرسائل المتقدم (fwc)
    m.reply(`🏮 *مدة التشغيل الحالية البوت (Runtime)*\n\n${muptime}`, null, fwc) 
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['مدة_التشغيل']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['التشغيل', 'مدة_التشغيل', 'الوقت', 'runtime', 'uptime']

export default handler 

// دالة برمجية مساعدة لتحويل الملي ثانية إلى صيغة أيام، ساعات، دقائق، وثوانٍ منسقة بالعربية
function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  
  // تنسيق المخرجات بإضافة الأصفار التوضيحية عند الحاجة (مثال: 05 دقائق بدلاً من 5)
  return [d, 'يوم ', h, 'ساعة ', m, 'دقيقة ', s, 'ثانية '].map(v => v.toString().padStart(2, 0)).join(' ')
}
