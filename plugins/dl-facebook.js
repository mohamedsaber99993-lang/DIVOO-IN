import fg from 'fg-senna'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  
  // 1. التحقق من وجود الرابط: إذا لم يقم المستخدم بوضع رابط بجانب الأمر، يتم توجيهه للمثال الصحيح
  if (!args[0]) throw `✳️ يرجى إدخال رابط فيديو من فيسبوك\n\n📌 مثال على الاستخدام :\n*${usedPrefix + command}* https://fb.watch/d7nB8-L-gR/`
  
  // إظهار تفاعل الانتظار المؤقت (جاري التحميل)
  m.react(rwait)

  try {
    // 2. استدعاء دالة fbdl من مكتبة fg-senna لتحليل الرابط واستخراج ميديا الفيديو
    let res = await fg.fbdl(args[0])
    
    // 3. إرسال الفيديو الناتج بجودته العالية (HD) مباشرة إلى المحادثة
    await conn.sendFile(m.chat, res.HD, 'fb.mp4', `✅ تم التحميل بنجاح`, m, null, fwc)
    
    // إظهار تفاعل النجاح واكتمال الإرسال
    m.react(done)
    
  } catch (error) {
    // التعامل الآمن مع الأخطاء في حال كان الرابط خاصاً أو غير صالح
    console.error(error)
    m.reply("❌ حدث خطأ أثناء التحميل، يرجى المحاولة مرة أخرى لاحقاً.") 
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحميل_فيسبوك'].map(v => v + ' <الرابط>')
handler.tags = ['التحميلات / الميديا']

// التعبير النمطي للتعرف على الأوامر (يدعم الاختصارات والكلمات العربية والأجنبية)
handler.command = /^((facebook|fb|فيسبوك|فيس)(downloder|dl)?)$/i
handler.diamond = true // تفعيل خيار استهلاك الألماس (إن كان نظام النقاط مفعلاً في بوتك)

export default handler
