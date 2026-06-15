import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

let handler = async (m, { conn, text }) => {

  try {
    // وضع تفاعل تلقائي (إيموجي الانتظار) على رسالة المطور
    m.react('⏳')

    // 1. تنفيذ أمر التحديث وجلب البيانات من جيت هاب (Git Pull)
    const { stdout, stderr } = await execPromise(
      'git pull' + (text ? ' ' + text : '')
    )

    // صياغة الرسالة النهائية بناءً على مخرجات النظام
    let result = stdout || '✅ تم تحديث المستودع بنجاح، البوت على آخر إصدار.'

    if (stderr) result += '\n⚠️ ' + stderr

    // 2. إرسال تقرير التحديث باللغة العربية
    await conn.reply(m.chat, `📦 *تحديث نظام البوت (Git Update)*\n\n${result}`, m)

    // 3. إعادة تحميل الإضافات والملفات برمجياً في الوقت الفعلي إذا كان النظام يدعم ذلك
    if (global.reload) {
      global.reload()
    }

    // وضع تفاعل تلقائي (إيموجي الإتمام) للإشارة إلى نجاح العملية
    m.react('✅')

  } catch (err) {
    // 4. خطة بديلة وإشعار في حال حدوث خطأ أثناء الاتصال بجيت هاب أو تعارض الملفات
    await conn.reply(
      m.chat,
      `❌ *فشل تحديث البوت*\n\nالسبب: ${err.message}`,
      m
    )

    m.react('❌')

  }

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تحديث_البوت']
handler.tags = ['إعدادات متقدمة للمطور']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['update', 'actualizar', 'fix', 'fixed', 'تحديث', 'اصلاح', 'إصلاح']

// قفل أمان مطلق: متاح فقط وحصرياً لمالك ومنشئ البوت الأساسي منعاً لتداخل ملفات السيرفر
handler.rowner = true

export default handler
