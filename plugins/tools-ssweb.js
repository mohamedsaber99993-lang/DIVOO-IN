import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, text }) => {

    // 1. التحقق الاستباقي: إذا لم يقم المستخدم بإدخال رابط الموقع
    if (!text) return m.reply('✳️ يرجى إدخال رابط موقع صحيح.')

    try {
        // وضع تفاعل الانتظار الافتراضي (rwait)
        m.react(rwait)

        let url = text.trim()
        // تصحيح الرابط تلقائياً وإضافة بروتوكول الحماية إذا لم يكتبه المستخدم
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url

        // 📸 ميزة تصوير الصفحة بالكامل إذا كان الأمر ينتهي بحرف "f"
        let full = /f$/i.test(command)

        // استدعاء الـ API لجلب لقطة الشاشة للموقع المحدد
        let res = await fetch(global.API('fg_ss', '/api/ssweb', { url, delay: 1000, full }))

        if (!res.ok) throw new Error(`Error API: ${res.status}`)

        let buffer = await res.buffer()

        // 2. إرسال لقطة الشاشة الناتجة كصورة إلى الدردشة
        await conn.sendFile(m.chat, buffer, 'captura.png', '✅ إليك لقطة الشاشة للموقع المطلوب:', m)

        // وضع تفاعل الإتمام (done) بعد نجاح العملية
        m.react(done)

    } catch (e) {
        // 3. إدارة الأخطاء في حال كان الموقع مغلقاً أو فشل الـ API في الاتصال
        m.reply('❌ عذراً، حدث خطأ أثناء محاولة توليد لقطة الشاشة للموقع.')
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['لقطة_موقع <الرابط>', 'لقطة_كاملة <الرابط>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['ssweb', 'ss', 'captura', 'ssf', 'sswebf', 'لقطة', 'لقطة_موقع', 'صورة_موقع', 'شاشة']

export default handler
