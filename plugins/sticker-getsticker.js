import fg from 'fg-senna'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  // 1. التحقق الاستباقي: إذا لم يقم المستخدم بكتابة الكلمة المراد البحث عنها
  if (!text) {
    throw `✳️ يرجى إدخال نص أو اسم الحزمة المراد البحث عنها.\n\n📌 *مثال:* ${usedPrefix + command} ميسي`
  }

  try {
    // بدء عملية الاستعلام والبحث عن الملصقات عبر الـ API الخاص بالمكتبة
    let json = await fg.getsticker(text)

    // في حال عدم العثور على أي نتائج مطابقة
    if (!json || !json.sticker_url || !json.sticker_url.length) {
      return m.reply('❌ لم يتم العثور على أي حزم ملصقات مطابقة للبحث.')
    }

    // تحديد الحد الأقصى بـ 10 ملصقات فقط للحزمة الواحدة لتجنب تهنيج وتوقف البوت أو تطبيق الواتساب
    let stickers = json.sticker_url.slice(0, 10)

    // 2. إرسال تقرير نتيجة البحث باللغة العربية قبل بدء إرسال الملصقات
    await m.reply(`
✅ *تم العثور على الحزمة بنجاح*

▢ *العنوان:* ${json.title || 'بدون عنوان'}
▢ *إجمالي ملصقات الحزمة:* ${json.sticker_url.length}
▢ *جاري إرسال:* ${stickers.length} ملصقات
`)

    // 3. حلقة تكرارية لإرسال الملصقات المحددة مباشرة إلى الدردشة
    for (let url of stickers) {
      try {
        // إرسال الرابط مباشرة كملصق (asSticker) دون الحاجة لعمليات تحويل مستهلكة للمساحة
        await conn.sendFile(m.chat, url, 'sticker.webp', '', m, false, { asSticker: true })

        // ⏱️ تأخير زمني ذكي بمقدار 800 ملي ثانية بين كل ملصق والآخر لحماية البوت من الحظر (Anti-Flood)
        await delay(800)

      } catch (e) {
        console.log('خطأ أثناء إرسال الملصق:', e)
      }
    }

  } catch (err) {
    console.error(err)
    m.reply('❎ خطأ برمي داخلي: فشل أثناء محاولة البحث عن حزم الملصقات.')
  }

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['بحث_ملصقات <النص>']
handler.tags = ['قسم الملصقات (Stickers)']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['getsticker', 'getstick', 'stickersearch', 'sticksearch', 'بحث_ملصقات', 'جلب_ملصقات']

// تفعيل نظام استهلاك الألماس (إذا كان البوت يعتمد على نظام عملات/ألماس لتشغيل بعض الأوامر)
handler.diamond = true

export default handler

// دالة برمجية مساعدة لإنشاء عملية التأخير الزمني (Delay)
const delay = ms => new Promise(res => setTimeout(res, ms))
