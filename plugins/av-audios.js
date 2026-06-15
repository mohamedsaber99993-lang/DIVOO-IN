let handler = m => m

handler.all = async function (m) {
  // حلقة تكرارية للمرور على جميع الكلمات المفتاحية الموجودة في قائمة الأصوات (audioMsg)
  for (const message in audioMsg) {
    // استخدام التعبير النمطي لفحص ما إذا كان نص الرسالة يطابق تماماً الكلمة المفتاحية (مع تجاهل حالة الأحرف)
    if (new RegExp(`^${message}$`, 'i').test(m.text)) {
      
       // إرسال الملف الصوتي المرتبط بالكلمة كمقطع صوتي عادي (mp3)
       this.sendFile(m.chat, audioMsg[message], 'audio.mp3', null, m, false)
       
       // سطر بديل (معطل حالياً) لإرسال الصوت كرسالة صوتية مباشرة / ريكورد (ptt) بصيغة ogg
       // this.sendFile(m.chat, audioMsg[message], 'audio.ogg', '', m, true, { asAudio: true, ptt: true})
       
       break // التوقف عن الفحص بمجرد العثور على التطابق الأول وإرسال الصوت
    }
  }
  return !0
}

export default handler

/**
 * قائمة الكلمات المفتاحية والمسارات الصوتية المرتبطة بها
 * يمكنك تعديل الكلمات (المفاتيح) إلى اللغة العربية لتناسب مستخدمي البوت الخاص بك
 */
let audioMsg = {
  'فخم يا سادة': './src/mp3/fino.mp3', // مثال لتعريب الكلمة المفتاحية مع الحفاظ على المسار المحلي
  'صباح الخير': 'https://k.top4top.io/m_2826iqdri1.mp3',
  'مساء الخير': 'https://b.top4top.io/m_2826v2zg51.mp3',
  'تصبح على خير': 'https://i.top4top.io/m_2826o8rfj1.mp3',
  'حزين': 'https://h.top4top.io/m_2826mcim21.mp3',
  '@246252335804458': 'https://l.top4top.io/m_2492i4mdu1.mp3'
}
