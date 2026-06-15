let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {

  // 1. جلب كائن قاعدة بيانات الجروب والتحقق من تفعيل الترحيب كشرط أساسي للمحاكاة
  let chat = global.db.data.chats[m.chat]
  if (!chat.welcome) throw `✳️ لاستخدام أمر المحاكاة، يجب أولاً تفعيل نظام الترحيب باستخدام الأمر التالي:\n\n *${usedPrefix}on* welcome`
  
  // صياغة واجهة دليل الأحداث المتاحة باللغة العربية
  let te = `
┌─⊷ *قائمة أحداث النظام المتاحة للمحاكاة*
▢ *welcome* ← محاكاة رسالة ترحيب بعضو جديد.
▢ *bye* ← محاكاة رسالة وداع لعضو غادر.
▢ *promote* ← محاكاة إشعار ترقية عضو إلى مشرف.
▢ *demote* ← محاكاة إشعار تنزيل مشرف إلى عضو عادي.
└───────────
  
📌 *طريقة الاستخدام الصحيحة:*
*${usedPrefix + command}* اسم_الحدث @المنشن

📌 *مثال حقيقي:*
*${usedPrefix + command}* welcome @user`

  // إذا لم يقم المشرف بتحديد نوع الحدث المراد محاكاته، يتم عرض الدليل التوضيحي فوراً
  if (!event) return await m.reply(te) 

  // معالجة واقتطاع المنشن (التايج) المرفق مع الأمر لتطبيق المحاكاة عليه
  let mentions = text.replace(event, '').trimStart()
  let who = mentions ? conn.parseMention(mentions) : []
  let part = who.length ? who : [m.sender] // إذا لم يتم عمل منشن لأحد، يتم تطبيق المحاكاة على مرسل الأمر نفسه
  let act = false
  
  // إرسال إشعار بدء عملية المحاكاة باللغة العربية
  m.reply(`✅ جاري الآن محاكاة وتوليد حدث: [ ${event} ]...`)
  
  // 2. هندسة تحويل الكلمات المفتاحية (العربية والإنجليزية) إلى إجراءات برمجية مفهومة للخادم
  switch (event.toLowerCase()) {
        case 'add':
        case 'bienvenida':
        case 'invite':
        case 'welcome':
        case 'ترحيب':
        case 'دخول':
           act = 'add' // إجراء إضافة عضو جديد للجروب
         break 
         
        case 'bye':
        case 'despedida':
        case 'leave':
        case 'remove':
        case 'وداع':
        case 'خروج':
         act = 'remove' // إجراء مغادرة عضو من الجروب
        break

        case 'promote':
        case 'promover':
        case 'ترقية':
        case 'مشرف':
          act = 'promote' // إجراء ترقية عضو إلى رتبة أدمن
        break

        case 'demote':
        case 'degradar':
        case 'تنزيل':
        case 'إعفاء':
         act = 'demote' // إجراء سحب صلاحيات الإشراف من الأدمن
        break

        default:
          // في حال كتابة حدث غير مدعوم في المصفوفة، يتم إلقاء الدليل الإرشادي مجدداً
          throw te
  }
  
  // 3. ترحيل وبث الحزمة الوهمية للحدث إلى نظام الاستماع التلقائي في البوت (Event Listener)
  if (act) return conn.participantsUpdate({
    id: m.chat,
    participants: part,
    action: act
  })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['محاكاة [اسم_الحدث] @العضو']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['محاكاة', 'محاكاه', 'جرب', 'simular', 'simulate'] 

// أقفال الحماية والصلابة البرمجية للأمر
handler.admin = true   // قفل حماية: يسمح للمشرفين فقط بمحاكاة رسائل النظام للجروب
handler.group = true   // يعمل هذا الأمر داخل المجموعات (الجروبات) فقط لارتباطه بأحداث الأعضاء

export default handler
