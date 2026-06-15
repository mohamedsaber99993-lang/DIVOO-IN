let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    // دالة برمجية مساعدة لتنظيف رقم الهاتف من الفراغات والرموز الخاصة
    function no(number){
        return number.replace(/\s/g,'').replace(/([@+-])/g,'')
    }

    text = no(text)

    // فرز وتحليل النص للتعرف على الرقم سواء كان منشن أو نص مكتوب
    if(isNaN(text)) {
        var number = text.split`@`[1]
    } else if(!isNaN(text)) {
        var number = text
    }

    // 1. التحقق الاستباقي: إذا لم يقم المطور بعمل منشن أو الإشارة لأي مستخدم
    if(!text && !m.quoted) return m.reply(`✳️ يرجى عمل منشن أو الإشارة للمدخل المراد إلغاء حظره.`)
    
    // التحقق من صحة الرقم المدخل
    if(isNaN(number)) return m.reply(`✳️ الرقم الذي تم إدخاله غير صالح أو غير صحيح.`)

    try {
        // تحديد المعرف الخاص بالمستخدم بناءً على طريقة الإشارة (نص أو رد على رسالة)
        if(text) {
            var user = number + '@s.whatsapp.net'
        } else if(m.quoted.sender) {
            var user = m.quoted.sender
        } else if(m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
        }  
    } catch (e) {
        // إدارة الأخطاء الصامتة
    } finally {
        let number = user.split('@')[0]
        let num = global.db.data.users[user]
        
        // 2. تحديث حالة المستخدم في قاعدة البيانات إلى (غير محظور)
        num.banned = false
        
        // 3. إرسال رسالة التأكيد بالالغة العربية مع عمل تاغ للمستخدم الذي تم إلغاء حظره
        conn.reply(m.chat, `
✅ *تم إلغاء الحظر بنجاح*

───────────
الحساب: @${number} 
تم رفع القيود، ويمكنه الآن استخدام أوامر البوت مجدداً.`, m, { mentions: [user] })
    }
    
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['الغاء_حظر @المستخدم']
handler.tags = ['أوامر المطور والمشرف']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['الغاء_الحظر', 'الغاء_حظر', 'فك_الحظر', 'unban'] 

// تفعيل قفل المطور الأصلي (صاحب البوت فقط من يمكنه استخدام هذا الأمر)
handler.rowner = true

export default handler
