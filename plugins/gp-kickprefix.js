let handler = async (m, { conn, isAdmin, isBotAdmin, args, participants, groupMetadata }) => {
	
    // 1. التحقق الاستباقي: إذا لم يكتب المشرف رمز الدولة أو لم يكن رقماً صحيحاً
    if (!args[0] || isNaN(args[0])) return m.reply(`✳️ يرجى إدخال رمز دولة (مقدمة رقم) صحيح وصالح.\n\n📌 مثال: *${usedPrefix + command}* 966`)
    
    // إزالة علامة (+) إذا قام المستخدم بكتابتها لضمان دقة الفحص البرمجي
    let prefix = args[0].replace(/[+]/g, '')
    
    // جلب قائمة المشرفين وتحديد هوية منشئ المجموعة (المالك) لحمايتهم من الطرد
    let groupAdmins = participants.filter(p => p.admin)
    let ownergp = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

    // دالة برمجية مساعدة لإنشاء فاصل زمني (تأخير) لتفادي حظر البوت
    const delay = (time) => new Promise((res) => setTimeout(res, time));

    // 2. تصفية الأعضاء: استخراج الأرقام التي تبدأ بالرمز المحدد، مع استثناء البوت ومالك المجموعة تلقائياً
    let gpUser = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(prefix) && v !== ownergp)
    
    // إذا لم يتم العثور على أي عضو في المجموعة يحمل رمز الدولة هذا
    if (gpUser.length === 0) return m.reply(`✳️ المجموعة لا تحتوي على أي أعضاء يبدأ رقمهم بالرمز: +${prefix}`)

    // إشعار بدء العملية وعرض عدد الأعضاء المستهدفين بالطرد
    m.reply(`✅ جاري الآن إزالة وتطهير *${gpUser.length}* عضواً من المجموعة... يرجى الانتظار.`)

    // 3. حلقة التكرار الذكية للطرد الجماعي الآمن (Rate-Limit Protection)
    for (const users of gpUser) {
        try {
            await delay(1000) // انتظار ثانية قبل الإرسال
            // إرسال حزمة الطرد الرسمية للعضو المستهدف حالياً
            await conn.groupParticipantsUpdate(m.chat, [users], 'remove')
            await delay(10000) // انتظار 10 ثوانٍ كاملة بين كل عضو والآخر لحماية البوت من الحظر (Anti-Ban)
           
        } catch (error) {
            console.log(error) // تسجيل الأخطاء في لوحة التحكم إن وجدت دون إيقاف السكريبت
        }
    }
    
    // 4. إشعار إتمام العملية بنجاح باللغة العربية
    m.reply(`✅ تم الانتهاء بنجاح من عملية التطهير وطرد جميع الأعضاء المحددين.`)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تطهير_مقدمة [كود_الدولة]']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['طرد_مقدمة', 'تطهير', 'تصفية_دول', 'kickpre', 'kickprefix']

// أقفال الحماية والصلابة البرمجية للأمر
handler.admin = true      // قفل حماية: يسمح للمشرفين فقط باستخدام هذا الأمر الخطير
handler.group = true      // يعمل هذا الأمر داخل المجموعات فقط
handler.botAdmin = true   // يشترط أن يكون البوت مشرفاً ليمتلك صلاحية التحكم وإخراج الأعضاء

export default handler
