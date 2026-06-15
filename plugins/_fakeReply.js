export async function before(m, { conn }) {

  // اسم القناة أو الجهة التي سيظهر النص بأنه مُحوّل منها
  const nam = "★ 𝐈𝐍 | 𝐃𝐀𝐒𝐇 🎖"

  /**
   * إعداد كائن التوجيه العالمي (global.fwc)
   * يُستخدم هذا الكائن في الأوامر الأخرى لإضافة شريط "رسالة محوّلة" (Forwarded) فوق الرسائل
   * بهدف حماية الرسائل من الحظر أو لمنحها مظهراً احترافياً مرتبطاً بقناة واتساب.
   */
  global.fwc = {
    contextInfo: {
      isForwarded: true, // تفعيل شارة "رسالة محوّلة"
      forwardedNewsletterMessageInfo: {
        newsletterJid: id_canal, // المعرّف الفريد لقناة الواتساب (JID)
        serverMessageId: 100,     // الرقم التعريفي للرسالة على الخادم
        newsletterName: nam       // العرض النصي لاسم القناة
      }
    }
  }

  //---
  // جلب الملف الشخصي التجاري للبوت (معطل حالياً)
  // global.business = await conn.getBusinessProfile(conn.user.jid)
  //---
  
}
