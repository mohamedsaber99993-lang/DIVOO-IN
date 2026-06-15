let handler = async (m, { conn, text }) => {

  // 1. جلب وتصفية المحادثات والدردشات المتاحة والنشطة في ذاكرة البوت
  let chats = Object.entries(conn.chats)
    .filter(([_, chat]) => chat?.isChats)
    .map(v => v[0])

  if (!chats.length) throw '❌ لا توجد أي محادثات أو دردشات متاحة حالياً لإرسال الإذاعة إليها.'

  // 2. تحديد نص الرسالة المستهدفة (سواء كانت مكتوبة أو تم الرد عليها "Quoted")
  let msg = m.quoted ? await m.getQuotedObj().catch(_ => null) : m

  let teks = text || msg?.text || ''
  if (!teks) throw '❌ يرجى كتابة نص أو الرد على الرسالة المراد عمل إذاعة جماعية لها.'

  // 3. صياغة وتنسيق قالب رسالة الإذاعة العامة باللغة العربية
  let finalText = /bc|broadcast|tx/i.test(teks)
    ? teks
    : `*إشعار رسمي ┃ إدارة البوت (STAFF)*\n━━━━━━━━━━━━━━━\n\n${teks}`

  // إشعار المطور ببدء عملية البث الجماعي
  await conn.reply(m.chat, `📢 جاري بدء الإرسال والتوصيل إلى *${chats.length} محادثة...*`, m)

  let sukses = 0
  let gagal = 0

  // 4. حلقة تكرارية لنسخ وتوجيه الرسالة لكافة المحادثات بأمان
  for (let id of chats) {
    try {
      await conn.copyNForward(
        id,
        conn.cMod(m.chat, msg, finalText),
        true
      )
      sukses++

      // ⏱️ تأخير زمني ذكي لحماية رقم البوت من الحظر التلقائي (Anti-ban)
      await new Promise(r => setTimeout(r, 800))

    } catch (e) {
      gagal++
    }
  }

  // 5. تقرير النتيجة النهائية باللغة العربية بعد اكتمال الإرسال الجماعي
  await conn.reply(m.chat, `✅ تم الانتهاء من عملية الإذاعة الجماعية بنجاح.\n\n✔️ تم الإرسال إلى: ${sukses}\n❌ فشل الإرسال إلى: ${gagal}`, m)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['إذاعة [الرسالة]']
handler.tags = ['أوامر المطور والمشرف']

// التعبير النمطي للمصفوفة البرمجية لدعم الكلمات العربية والإنجليزية بالتبادل
handler.command = /^(broadcast|bc|tx|اذاعه|إذاعة|نشر|نشر_عام)$/i

// قفل الأمان: متاح فقط لمالك ومطور البوت الأساسي
handler.owner = true

export default handler
