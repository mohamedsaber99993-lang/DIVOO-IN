function handler(m) {
    // 1. تصفية وفرز البيانات لجلب حساب منشئ البوت الأساسي (Creator) من القائمة العامة
    let data = global.owner.filter(([id, isCreator]) => id && isCreator);

    let numberowner = data[0]?.[0] || '' // رقم هاتف المطور الأساسي
    let gmail = "boodixx74@gmail.com"        // البريد الإلكتروني للمطور
    let instagram = fg_ig                 // رابط حساب إنستغرام
    let onum = 'رقم منشئ ومطور البوت'      // النص التوضيحي داخل بطاقة الاتصال

    // 2. دمج وصياغة مصفوفة البيانات لإعداد بطاقات الاتصال الرقمية (Contacts)
    const contacts = data.map(([id, name]) => [id, name, numberowner, gmail, instagram, onum])

    // 3. استدعاء دالة البوت لإرسال بطاقة جهة الاتصال مباشرة إلى المحادثة
    this.sendContact(m.chat, contacts, m)
    
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['المطور']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغات العربية، الإنجليزية، والإسبانية
handler.command = ['المطور', 'المالك', 'المبرمج', 'owner', 'creator', 'creador', 'dueño', 'fgowner'] 

export default handler
