import fg from 'fg-senna'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  // 1. التحقق الاستباقي: إذا لم يكتب المستخدم الكلمة المراد البحث عنها
  if (!text) throw `✳️ يرجى إدخال اسم أو نوع الخلفية التي ترغب في البحث عنها.\n\n📌 *مثال:* *${usedPrefix + command}* خلفيات أنمي`

  try {
    // 2. استدعاء محرك جلب الخلفيات بناءً على النص المدخل
    let res = await fg.wallpaper(text)

    // التحقق من وجود نتائج في مصفوفة البيانات المستلمة
    if (!res || !res.length) {
      throw `❌ لم يتم العثور على أي نتائج مطابقة لبحثك.`
    }

    // اختيار خلفية واحدة بشكل عشوائي وذكي من قائمة النتائج
    let random = pickRandom(res)

    // 3. إرسال الصورة النهائية إلى المحادثة مع العنوان التوضيحي باللغة العربية
    await conn.sendMessage(m.chat, { 
      image: { url: random.image }, 
      caption: `🖼️ *تم العثور على الخلفية بنجاح*\n\n📌 *العنوان:* ${random.title}`
    }, { quoted: m })

  } catch (error) {
    // التعامل الآمن مع الأخطاء في حال حدوث مشكلة في الاتصال بالخادم
    m.reply(`❌ عذراً، حدث خطأ أثناء محاولة البحث عن الخلفية.`)
  }

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['خلفية [نص_البحث]']
handler.tags = ['الوسائط والترفيه']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['خلفية', 'خلفيات', 'خلفيه', 'wallpaper', 'wallpapers', 'wp']

// إعدادات الاقتصاد الداخلي للبوت (RPG)
handler.diamond = true // يخصم (1 ألماس) من رصيد المستخدم عند كل عملية بحث ناجحة لتنظيم الاستهلاك

export default handler

// دالة برمجية مساعدة لاختيار عنصر عشوائي من مصفوفة النتائج
function pickRandom(list){
  return list[Math.floor(Math.random() * list.length)]
}
