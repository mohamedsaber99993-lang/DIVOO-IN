import { toAudio, toPTT } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const isQuoted = m.quoted ? m.quoted : m
    const mime = (m.quoted ? m.quoted : m.msg).mimetype || ''

    // 1. التحقق الاستباقي: التحقق من نوع الملف والتأكد من أنه صوت أو فيديو
    if (!/audio|video/i.test(mime)) {
      throw `⚠️ يرجى الرد على مقطع فيديو أو ملف صوتي باستخدام الأمر: *${usedPrefix + command}*`
    }

    // بدء تحميل ملف الميديا من سيرفرات واتساب
    const media = await isQuoted.download()
    if (!media) throw '❌ فشل تحميل الملف، يرجى المحاولة مرة أخرى.'

    // ================= تحويل إلى ملف صوتي MP3 =================
    if (/mp3|audio$/i.test(command)) {
      const audio = await toAudio(media, 'mp4')
      if (!audio?.data) throw '❌ حدث خطأ أثناء التحويل إلى MP3.'

      conn.sendFile(m.chat, audio.data, 'audio.ogg', '', m, false)
      // في حال رغبت بإرساله كمستند غير مضغوط يمكنك تفعيل السطر التالي:
      // conn.sendMessage(m.chat, {document: audio.data, mimetype: 'audio/mpeg', fileName: 'audio.mp3'},{ quoted: m })
    }

    // ================= تحويل إلى ملاحظة صوتية (ريكورد) PTT / VOICE =================
    if (/vn|av$/i.test(command)) {
      const audio = await toPTT(media, 'mp4')
      if (!audio?.data) throw '❌ حدث خطأ أثناء التحويل إلى ملاحظة صوتية.'

      // إرسال الملف الصوتي كرسالة صوتية مباشرة (ptt: true)
      conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
    }

  } catch (err) {
    console.error('خطأ في نظام التحويل:', err)
    // إرسال نص الخطأ للمستخدم باللغة العربية
    m.reply(typeof err === 'string' ? err : '❌ حدث خطأ غير متوقع أثناء معالجة الصوت.')
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تحويل_لصوت', 'تحويل_لريكورد']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['tomp3', 'tovn', 'toav', 'toaudio', 'لصوت', 'لصوتي', 'لريكورد', 'تسجيل']

export default handler
