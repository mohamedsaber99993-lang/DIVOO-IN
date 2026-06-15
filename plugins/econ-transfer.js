let handler = async (m, { conn, args, usedPrefix, command }) => {
   
    // 1. صياغة رسالة الدليل الإرشادي في حال أخطأ المستخدم في كتابة الأمر
    let exa = `✳️ *طريقة استخدام أمر التحويل:*
*${usedPrefix + command}* [النوع] [الكمية] [@منشن_المستخدم]

📌 *مثال على الاستخدام:* *${usedPrefix + command}* coin 65 @${m.sender.split('@')[0]}

📍 *العناصر القابلة للتحويل حالياً:*
┌───────────────────
▢ *diamond* : الألماس 💎
▢ *coin* : العملات النقدية 🪙
└───────────────────`

    // التحقق من إدخال النوع والكمية كعوامل أساسية بجانب الأمر
    if (!args[0] || !args[1]) return m.reply(exa, null, { mentions: [m.sender] })
    
    let type = args[0].toLowerCase() // نوع العنصر (coin أو diamond)
    let amount = parseInt(args[1])    // الكمية المراد تحويلها رقمياً
    
    // تحديد هوية المستخدم المستلم (سواء بالمنشن أو بكتابة رقمه وتطهيره من الرموز)
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : ''
    
    // إذا لم يتم العثور على مستلم
    if (!who) return m.reply(`✳️ يرجى عمل منشن (@) للمستخدم الذي ترغب في التحويل إليه.`)
    
    // التحقق من أن العنصر المطلوب تحويله مدعوم في مصفوفة المتجر
    if (!['coin', 'diamond'].includes(type)) return m.reply(exa, null, { mentions: [m.sender] })
    
    // التحقق من أن الكمية عبارة عن رقم صالح وأكبر من 1
    if (isNaN(amount) || amount <= 1) throw `✳️ خطأ: الكمية المحددة يجب أن تكون رقماً صالحاً وموجباً.`
    
    let user = global.db.data.users[m.sender] // بيانات الحساب الشخصي (المرسل)
    let whoData = global.db.data.users[who]   // بيانات حساب المستلم في قاعدة البيانات
    
    // فحص وجود المستلم في السجلات لضمان عدم ضياع النقاط
    if (!whoData) return m.reply(`✳️ عذراً، هذا المستخدم غير مسجل في قاعدة بيانات البوت.`)
    
    // تحديد المسمى العربي للعنصر بناءً على الكلمة المفتاحية المكتوبة
    let currencyName = type === 'coin' ? `عملة نقدية (Coins)` : `ماسة (Diamonds)`
    
    // الحماية المالية: منع المرسل من تحويل مبالغ لا يمتلكها في رصيده الحالي
    if (user[type] < amount) throw `✳️ عذراً، رصيدك الحالي من *${currencyName}* غير كافٍ لإتمام عملية التحويل.`
    
    // 2. معالجة العملية: خصم النقاط من المرسل وإضافتها لحساب المستلم في قاعدة البيانات
    user[type] -= amount;
    whoData[type] += amount;
    
    // 3. إرسال رسالة تأكيد النجاح باللغة العربية مع عمل منشن للمستلم
    m.reply(`✅ تم إتمام عملية التحويل بنجاح!\n\n*الكمية:* [ ${amount.toLocaleString()} ] من *${currencyName}*\n*إلى حساب:* @${who.split('@')[0]}.`, null, { mentions: [who] })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحويل']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['تحويل', 'ادفع', 'اعطي', 'payxp', 'paydi', 'transfer', 'darxp', 'dardi', 'pay']
handler.disabled = false // تفعيل الأمر للعمل برمجياً وعدم تعطيله

export default handler
