import fg from "fg-senna"

let handler = async (m, { conn, text }) => {

  // 1. التحقق من إدخال اسم المستخدم: إذا لم يكتب المستخدم اسماً بجانب الأمر يتم تنبيهه
  if (!text) throw `✳️ يرجى إدخال اسم مستخدم حساب تيك توك المراد فصحه.\nمثال: .ttstalk khaby.lame`

  try {
    // 2. استدعاء دالة ttstalk من مكتبة fg-senna لجلب بيانات الحساب الحية
    let res = await fg.ttstalk(text)

    // التحقق من نجاح جلب البيانات وتواجد النتيجة لتجنب الأخطاء البرمجية
    if (!res) throw '❌ لم يتم العثور على هذا الحساب، تأكد من كتابة الاسم بشكل صحيح.'

    // 3. صياغة وعرض معلومات حساب التيك توك باللغة العربية
    let txt = `
┌──「 *بيانات حساب تيك توك 🎬* 」
▢ *📌 الاسم:* ${res.name || 'لا يوجد اسم معلن'}
▢ *👤 اسم المستخدم:* ${res.username}
▢ *👥 المتابعون (Followers):* ${res.followers.toLocaleString()}
▢ *🫂 يتابع (Following):* ${res.following.toLocaleString()}
▢ *❤️ الإعجابات (Likes):* ${res.likes.toLocaleString()}
▢ *🎥 عدد الفيديوهات:* ${res.videos.toLocaleString()}
▢ *👥 الأصدقاء:* ${res.friends.toLocaleString()}
▢ *📝 السيرة الذاتية (Bio):* ${res.bio || 'فارغة'}
▢ *🔗 رابط الحساب المباشر:* https://tiktok.com/@${res.username}
└───────────────────`

    // 4. إرسال الصورة الشخصية للحساب (Avatar) مع النص التوضيحي المنسق
    await conn.sendFile(m.chat, res.avatar, 'tt.png', txt, m, null, fwc)

  } catch (e) {
    // التعامل الآمن مع الأخطاء في حال كان الحساب محذوفاً أو حدثت مشكلة في الخادم
    console.log(e)
    m.reply(`✳️ حدث خطأ أثناء جلب معلومات الحساب، يرجى المحاولة مرة أخرى لاحقاً.`)
  }

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['فحص_تيكتوك']
handler.tags = ['التحري / الأدوات']

// التعبير النمطي للتعرف على الأوامر (يدعم الاختصارات والكلمات الأجنبية)
handler.command = /^t(tstalk|معلومات)$/i

export default handler
