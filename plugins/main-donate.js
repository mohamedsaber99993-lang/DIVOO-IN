let handler = async(m, { conn, usedPrefix, command }) => {

    // صياغة نص رسالة الدعم والتبرع باللغة العربية وتنسيقها بشكل واضح
    let don = `
≡ *دعم وتطوير البوت (DONATION)*
يمكنك المساهمة في دعم المشروع إذا كنت ترغب في مساعدتنا على إبقاء البوت نشطاً ومستقراً على السيرفر.

▢ *حساب بايبال (PayPal)*
• *الرابط:* https://wa.me/message/72R5BJPAHVO7G1

▢ *محفظة أوالا الأرجنتين (Uala Arg)*
• *الاسم المستعار (Alias):* fg.error
`
    // رابط الصورة التوضيحية الخاصة بصفحة الدعم
    let img = 'https://i.ibb.co/37FP2bk/donate.jpg'
    
    // إرسال الصورة مرفقة بنص الدعم مع قالب اقتباس الرسائل المتقدم (fwc)
    conn.sendFile(m.chat, img, 'img.jpg', don, m, null, fwc)
    //conn.sendPayment(m.chat, '2000', 'USD', don, m.sender, m)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['الدعم']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغات العربية، الإنجليزية، والإسبانية
handler.command = ['دعم', 'الدعم', 'تبرع', 'تطوير', 'apoyar', 'donate', 'donar'] 

export default handler
