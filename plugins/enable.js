let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {

  // 1. التحقق من طبيعة الأمر: هل هو تفعيل (true, on, 1) أم تعطيل؟
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false
  
  // 2. فحص نوع الميزة المطلوبة والتحقق من صلاحيات المستخدم
  switch (type) {
    case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable // ميزة الترحيب بالأعضاء الجدد
      break
      
    case 'detect':
    case 'detector':
      if (!m.isGroup) {
         if (!isOwner) {
           global.dfail('group', m, conn)
          throw false
        }
       } else if (!isAdmin) {
         global.dfail('admin', m, conn)
         throw false
       }
       chat.detect = isEnable // ميزة كشف التغيرات في المجموعة (مثل تغيير الاسم أو الصورة)
     break
    
    case 'antidelete':
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.delete = !isEnable // ميزة مضاد حذف الرسائل
      break

    case 'document':
    case 'documento':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
      }
      chat.useDocument = isEnable // ميزة إرسال الملفات كوثائق
      break
      
    case 'public':
    case 'publico':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['self'] = !isEnable // تحويل البوت من عام إلى خاص
      break
      
    case 'antilink':
    case 'antilinkwa':
    case 'antilinkwha':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable // ميزة مضاد الروابط (طرد من يرسل رابطاً)
      break
      
    case 'captcha':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.captcha = isEnable // ميزة اختبار التحقق (كابتشا) للأعضاء الجدد
      break
      
    case 'antibotclone':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBotClone = isEnable // ميزة حظر البوتات المستنسخة
      break
      
    case 'nsfw':
    case '+18':
       if (m.isGroup) {
         if (!(isAdmin || isOwner)) {
           global.dfail('admin', m, conn)
            throw false
           }
       }
       chat.nsfw = isEnable // ميزة محتوى البالغين (+18)
       break

    case 'autolevelup':
      isUser = true
      user.autolevelup = isEnable // ميزة رفع المستوى التلقائي للمستخدم
      break
     
    case 'chatbot':
    case 'autosimi':
    case 'autosimsimi':
      isUser = true
      user.chatbot = isEnable // ميزة الرد الآلي الذكي (الذكاء الاصطناعي للبوت)
      break
     
    case 'restrict':
    case 'restringir':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      bot.restrict = isEnable // ميزة تقييد المستخدمين (تفعيل الطرد/الحظر)
      break
    
    case 'onlypv':
    case 'onlydm':
    case 'onlymd':
    case 'solopv':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      bot.solopv = isEnable // ميزة استقبال الأوامر في الخاص فقط
      break
      
    case 'gponly':
    case 'onlygp':
    case 'grouponly':
    case 'sologp':
    case 'sologrupo':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      bot.sologp = isEnable // ميزة العمل داخل المجموعات فقط
      break
      
    default:
      // 3. عرض قائمة الخيارات المتوفرة باللغة العربية إذا لم يحدد المستخدم ميزة صالحة
      if (!/[01]/.test(command)) return m.reply(`
≡ *قائمة الخيارات المتاحة للتحكم*

┌─⊷ *🛠️ إشراف المجموعة (Admins)*
▢ *captcha* (التحقق الآلي)
▢ *welcome* (الترحيب والوداع)
▢ *antilink* (مضاد الروابط)
▢ *detect* (كشف التغيرات)
▢ *document* (التعامل بالوثائق)
▢ *nsfw* (محتوى الكبار +18)
└───────────── 
┌─⊷ *👤 إعدادات المستخدمين (Users)*
▢ *autolevelup* (الترقية التلقائية لـ لفل)
▢ *chatbot* (الرد الآلي الذكي)
└─────────────
┌─⊷ *👑 ميزات المطورين (Owners)*
▢ *antibotclone* (حظر البوتات الوهمية)
▢ *public* (الوضع العام للبوت)
▢ *solopv* (العمل في الخاص فقط)
▢ *sologp* (العمل في المجموعات فقط)
└─────────────

📌 *طريقة الاستخدام الصحيحة:*
← للتفعيل: *${usedPrefix}on* [اسم_الميزة]
← للتعطيل: *${usedPrefix}off* [اسم_الميزة]

*مثال:* *${usedPrefix}on welcome*
`, null, fwc)
      throw false
}

  // 4. رسالة تأكيد النجاح بعد تغيير حالة الميزة بنجاح
  m.reply(`
✅ تم بنجاح *${isEnable ? `تفعيل 🟢` : `تعطيل 🔴`}* ميزة *[ ${type.toUpperCase()} ]* ${isAll ? `على مستوى البوت بالكامل` : isUser ? `لحسابك الشخصي` : `لهذه المجموعة حالياً`}.
`, null, fwc) 

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تفعيل', 'تعطيل'].map(v => v + ' [الميزة]')
handler.tags = ['إعدادات البوت']

// مصفوفة الكلمات المفتاحية باللغتين العربية والإنجليزية لضمان مرونة الاستجابة
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01]|تفعيل|تعطيل|تشغيل|اطفاء)$/i

export default handler
