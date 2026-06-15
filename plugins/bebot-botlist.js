import ws from 'ws';

async function handler(m, { usedPrefix }) {
  // 1. تصفية وجلب البوتات الفرعية النشطة فقط:
  // يتم فحص قاعدة البيانات العالمية واستخراج البوتات التي تمتلك جلسة مفعّلة ومقبس اتصال (Socket) غير مغلق (NOT CLOSED)
  let users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map(conn => conn.user)])]
  
  // 2. بناء وتنسيق قائمة البوتات باللغة العربية:
  // ترتيب البوتات وتوليد رابط واتساب مباشر لكل رقم مع رسالة تشغيل تلقائية للمنيو
  let b = users.map((v, i) => `_*${i + 1}.*_ *${v.name}*\nwa.me/${v.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}help`).join('\n\n')
 
  // 3. إرسال القائمة النهائية إلى المحادثة
  m.reply(` 
≡ *قائمة البوتات الفرعية النشطة*

▢ *إجمالي البوتات المتصلة حالياً:* ${users.length} 

${b ? b : '⚠️ لا توجد بوتات فرعية نشطة في الوقت الحالي.'}`) 
  
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['قائمة_البوتات']
handler.tags = ['التبويت / البوتات الفرعية']
handler.command = ['البوتات_النشطة', 'قائمة_البوتات', 'البوتات', 'المستنسخين'] 

export default handler
