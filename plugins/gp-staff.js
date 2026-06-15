let handler = async (m, { conn, participants, groupMetadata, args }) => {
    
    // 1. جلب الصورة الشخصية للمجموعة، وفي حال عدم وجودها يتم استخدام الصورة الافتراضية
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './src/avatar_contact.png'
    
    // تصفية وفرز الأعضاء الذين يمتلكون صلاحية مشرف (Admin) فقط
    const groupAdmins = participants.filter(p => p.admin)
    
    // إنشاء مصفوفة مرقمة تحتوي على تايج لكل مشرف برقم هاطفه الصافي
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ')
    
    // تحديد هوية مؤسس ومنشئ المجموعة الأساسي
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

    // 2. صياغة القائمة النهائية باللغة العربية وتنسيقها بشكل Scannable واضح
    let text = `
≡ *طاقم إدارة مجموعة:* _${groupMetadata.subject}_

┌─⊷ *قائمة المشرفين الحالية (ADMINS)*
▢ ${listAdmin}
└───────────
`.trim()

    // 3. إرسال الصورة الشخصية مرفقة بنص القائمة وحقن مصفوفة المنشن لضمان وصول الإشعار للمشرفين
    conn.sendFile(m.chat, pp, 'staff.png', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['المشرفين']
handler.tags = ['إشراف المجموعات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['المشرفين', 'المشرفون', 'الادارة', 'الإدارة', 'staff', 'admins', 'listadmin'] 

// قفل الأمان: تشغيل الأمر داخل المجموعات فقط لمنع الانهيار في الخاص
handler.group = true

export default handler
