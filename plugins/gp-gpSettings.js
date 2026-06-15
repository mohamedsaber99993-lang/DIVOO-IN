let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    // 1. هندسة الاختيار الفوري (Object Mapping): تحديد الحالة المطلوبة بناءً على الكلمة الممررة
    let isClose = {
        'open': 'not_announcement',   // 'open' تعني فتح المجموعة للجميع
        'close': 'announcement',       // 'close' تعني إغلاق المجموعة وجعلها للمشرفين فقط
        'فتح': 'not_announcement',     // دعم الكلمة العربية 'فتح'
        'قفل': 'announcement',         // دعم الكلمة العربية 'قفل'
        'غلق': 'announcement',         // دعم الكلمة العربية 'غلق'
    }[(args[0] || '').toLowerCase()]
    
    // 2. التحقق الاستباقي: إذا لم يقم المشرف بتحديد خيار صالح، يتم عرض دليل الاستخدام
    if (isClose === undefined) {
        return m.reply(`
🛡️ *إعدادات وتعديل حالة المجموعة*

تتيح لك هذه الميزة فتح المجموعة للجميع أو إغلاقها للمشرفين فقط.

📌 *طريقة الاستخدام الصحيحة:*
← للإغلاق: *${usedPrefix + command} close* أو *قفل*
← للفتح: *${usedPrefix + command} open* أو *فتح*

*أمثلة:*
*▢ ${usedPrefix + command} قفل*
*▢ ${usedPrefix + command} فتح*
`)
    }
    
    // 3. إرسال حزمة التحديث الرسمية لخوادم واتساب لتغيير حالة الجروب حياً
    await conn.groupSettingUpdate(m.chat, isClose)
    
    // 4. إشعار تأكيد النجاح باللغة العربية بناءً على الحالة الجديدة
    let statusText = (isClose === 'announcement') ? 'إغلاقها (للمشرفين فقط) 🔒' : 'فتحها (للجميع) 🔓'
    m.reply(`✅ تم بنجاح تعديل إعدادات المجموعة وتم ${statusText}.`)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['جروب [فتح/قفل]']
handler.tags = ['إشراف المجموعات']

// mصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['جروب', 'المجموعة', 'المجموعه', 'group', 'grupo'] 

// أقفال الحماية والصلابة البرمجية للأمر
handler.admin = true      // يشترط أن يكون مرسل الأمر مشرفاً في المجموعة
handler.botAdmin = true   // يشترط أن يكون البوت مشرفاً ليمتلك صلاحية تعديل الإعدادات
handler.group = true      // يعمل هذا الأمر داخل المجموعات (الجروبات) فقط

export default handler
