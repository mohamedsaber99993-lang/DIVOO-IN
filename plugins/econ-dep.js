let handler = async (m, { conn, text, usedPrefix, command, args }) => {
 
    // 1. التحقق من إدخال البيانات: إذا لم يكتب المستخدم شيئاً يتم توجيهه للمثال الصحيح
    if (!text) throw `✳️ طريقة استخدام الأمر:\n\n*${usedPrefix + command}* [الكمية أو كلمة all]\nمثال: *${usedPrefix + command}* 500\nمثال لإيداع الكل: *${usedPrefix + command}* all`
  
    // 2. التحقق من صحة المدخلات: يجب أن تكون الكمية رقماً صحيحاً موجباً أو كلمة 'all'
    if (args[0].toLowerCase() !== 'all' && !/^[1-9]\d*$/.test(args[0])) throw `✳️ خطأ: الكمية المحددة يجب أن تكون رقماً صالاً وصحيحاً.`
    
    // جلب الرصيد الإجمالي الحالي للمستخدم من العملات في المحفظة
    let all = Math.floor(global.db.data.users[m.sender].coin)
    
    // استبدال كلمة 'all' بالقيمة الإجمالية للرصيد إن وجدت، وضمان ألا تقل القيمة عن 1 برمجياً
    let count = args[0].replace('all', all)
    count = Math.max(1, count)
     
    // 3. فحص ما إذا كان المستخدم يملك القيمة المراد إيداعها في محفظته
    if (global.db.data.users[m.sender].coin >= count) {
      
      // الخصم من المحفظة والإضافة إلى رصيد البنك (Bank) في قاعدة البيانات
      global.db.data.users[m.sender].coin -= count
      global.db.data.users[m.sender].bank += count
  
      // إرسال رسالة تأكيد النجاح باللغة العربية
      m.reply(`✅ تم بنجاح إيداع *${count.toLocaleString()} 🪙* في حسابك البنكي.`, null, fwc)
      
    } else {
      // في حال محاولة إيداع مبلغ أكبر من الرصيد المتوفر
      m.reply(`❎ عذراً، ليس لديك ما يكفي من العملات في محفظتك لإتمام هذه العملية.`, null, fwc)
    }
  
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['إيداع']
handler.tags = ['الاقتصاد / العاب RPG']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['إيداع', 'ايداع', 'حفظ', 'dep', 'depositar'] 
  
export default handler
