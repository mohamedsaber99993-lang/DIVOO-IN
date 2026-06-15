let handler = async (m, { conn }) => {

    // جلب اسم المستخدم مرسل الرسالة من قاعدة بيانات الواتساب
    let name = await conn.getName(m.sender)
    
    // اختيار ملف صوتي ترحيبي عشوائي من المجلد المحلي (إما criss أو andrea)
    let av = `./src/mp3/${pickRandom(["criss", "andrea"])}.mp3`
    
    // رابط شعار البوت أو الصورة المصاحبة
    let fg_logo = `https://i.ibb.co/1zdz2j3/logo.jpg`

    // إرسال رسالة ترحيبية تحتوي على أزرار تفاعلية باللغة العربية
    conn.sendButton(m.chat, `أهلاً وسهلاً *${name}*\n`, global.fg_ig, null, [
      ['⦙☰ القائمة الرئيسية', '/help'],
      ['⦙☰ القائمة الإضافية', '/menu2'],
      [`⌬ مجموعات البوت`, '/gpdylux']
    ], m) 

    // إرسال الملف الصوتي الترحيبي العشوائي في نفس الوقت كمقطع صوتي عادي
    conn.sendFile(m.chat, av, 'audio.ogg', '', m, true, { asAudio: true, ptt: false })
    
    // سطر بديل (معطل حالياً) لإرسال الصوت بصيغة mp4 متوافقة
    // await conn.sendFile(m.chat, av, 'file.mp4', '', m, 1, { mimetype: 'audio/mp4' })
} 

// الكلمات المفتاحية التي يستجيب لها البوت تلقائياً عند ذكرها في الشات (مثل: بوت أو dylux)
handler.customPrefix = /^(bot|بوت|senna|dylux)$/i
handler.command = new RegExp

export default handler

/**
 * دالة برمجية مساعدة لاختيار عنصر عشوائي من مصفوفة
 * @param {Array} list قائمة العناصر
 * @returns {*} عنصر عشوائي من القائمة
 */
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
