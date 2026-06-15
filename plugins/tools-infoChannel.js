let handler = async (m, { conn, text }) => {
    // 1. التحقق الاستباقي: إذا لم يقم المستخدم بإدخال رابط القناة
    if (!text) throw `✳️ يرجى إدخال رابط قناة واتساب الصحيح.`;

    try {
        // تنظيف الرابط واستخراج معرّف الدعوة الخاص بالقناة (Invite ID)
        let id = text
            .replace(/https:\/\/(www\.)?whatsapp\.com\/channel\//, "")
            .split("/")[0]
            .trim();

        // جلب البيانات الوصفية الرسمية للقناة من سيرفرات الواتساب
        let metadata = await conn.newsletterMetadata("invite", id);

        let thread = metadata.thread_metadata;

        let name = thread?.name?.text || "غير متوفر";
        let subscribers = thread?.subscribers_count || "0";

        // تحويل طابع الوقت البرمجي (Timestamp) إلى صيغة تاريخ ووقت مفهومة باللغة العربية
        let created = thread?.creation_time? new Date(Number(thread.creation_time) * 1000).toLocaleString("ar-EG") : "غير متوفر";

        // جلب رابط الصورة الشخصية أو غلاف القناة الرسمي
        let img = thread?.preview?.direct_path? `https://pps.whatsapp.net${thread.preview.direct_path}` : null;

        // 2. صياغة كرت معلومات القناة باللغة العربية
        let info = `
*📢 معلومات قناة واتساب*

📌 *المعرّف (ID):* ${metadata.id}
🫧 *الاسم:* ${name}
👥 *المتابعون:* ${subscribers}
⏳ *تاريخ الإنشاء:* ${created}
`.trim();

        // 3. النتيجة النهائية: إرسال المعلومات مدمجة بصورة القناة أو إرسالها كنص في حال عدم وجود صورة
        if (img) {
            await conn.sendFile(m.chat, img, 'channel.jpg', info, m);
        } else {
            await conn.reply(m.chat, info, m);
        }

    } catch (e) {
        // إشعار الفشل في حال كان الرابط خاطئاً أو القناة خاصة/محذوفة
        throw "❌ خطأ: تعذر جلب واستخراج معلومات هذه القناة. تأكد من صحة الرابط.";
    }
};

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['معلومات_قناة <الرابط>'];
handler.tags = ['أدوات ومساعدة'];

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['ci', 'channelinfo', 'cinfo', 'قناة', 'معلومات_قناة', 'فحص_قناة'];

export default handler;
