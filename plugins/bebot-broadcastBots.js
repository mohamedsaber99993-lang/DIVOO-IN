let handler = async (m, { conn, usedPrefix, text }) => {
    // قيد أمني: التأكد من أن الذي ينفذ الأمر هو البوت الرئيسي فقط وليس أحد البوتات الفرعية
    if (conn.user.jid !== global.conn.user.jid) throw false
    
    // 1. تصفية وجلب معرّفات (JID) جميع البوتات الفرعية النشطة حالياً والتي ليست في حالة إغلاق
    let users = [...new Set([...global.conns.filter(conn => conn.user && conn.state !== 'close').map(conn => conn.user.jid)])]
    
    // 2. تحديد محتوى الرسالة المراد إذاعتها:
    // إما النص المكتوب بجانب الأمر، أو الرسالة التي تمت الإشارة إليها (Quoted)، أو الرسالة الحالية نفسها
    let cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m
    let teks = text ? text : cc.text
    
    // إرسال تقرير أولي لمالك البوت يوضح عدد البوتات الفرعية المستهدفة وقائمتها باللغة العربية
    conn.reply(m.chat, `✅ *بدء عملية الإذاعة*
    
*الإجمالي:* *${users.length}* بوت فرعي نشط مستهدف.\n\n${users.map((v, i) => `*${i + 1}.* wa.me/${v.replace(/[^0-9]/g, '')}?text=${usedPrefix}help`).join('\n')}`.trim(), m)
    
    // 3. تعديل وتنسيق نص الإذاعة لإضافة ترويسة احترافية تميز الرسائل الإدارية
    let content = conn.cMod(m.chat, cc, /txbot|broadcast/i.test(teks) ? teks : `📢 *إشعار إداري ┃ البوتات الفرعية*\n_____________________\n\n${teks}`)
    
    // 4. حلقة تكرارية لإرسال الرسالة لكل بوت فرعي على حدة مع وجود فاصل زمني لتجنب الحظر
    for (let id of users) {
      await delay(1500) // الانتظار لمدة ثانية ونصف بين كل رسالة وأخرى لحماية الحساب برمجياً
      await conn.copyNForward(id, content, true) // نسخ الرسالة وتوجيهها لخاص البوت الفرعي
    }
    
    // يمكنك تفعيل هذا السطر لإعلامك عند انتهاء الإذاعة بالكامل لجميع الحسابات
    await conn.reply(m.chat, `✅ *اكتملت الإذاعة!* تم إرسال الرسالة بنجاح إلى جميع البوتات الفرعية المتصلة.`, m)
} 

// إعدادات المساعدة والأوامر مع تعريبها لملائمة الاستخدام العربي
handler.help = ['إذاعة_للبوتات']
handler.tags = ['التبويت / البوتات الفرعية']
handler.command = ['إذاعة_للبوتات', 'اذاعه_المستنسخين', 'txbot'] 

// تفعيل قيد المالك الصارم: لا يمكن لأي مستخدم عادي أو مشرف تشغيل هذا الأمر، فقط مطور البوت الأساسي
handler.rowner = true

export default handler

/**
 * دالة برمجية لصناعة تأخير زمني مؤقت (Anti-Spam Delay)
 * @param {number} time عدد الميلي ثانية
 */
const delay = time => new Promise(res => setTimeout(res, time))
