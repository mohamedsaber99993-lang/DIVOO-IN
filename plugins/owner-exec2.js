import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isOwner, command, text }) => {
  // التحقق من هوية البوت المسجل
  if (conn.user.jid != conn.user.jid) return
  
  // 1. إرسال إشعار بدء تنفيذ أمر النظام (Terminal)
  m.reply('✅ جاري التنفيذ...')
  
  let o
  try {
    // دمج المدخلات وتشغيل الأمر مباشرة على سيرفر نظام التشغيل المضيف
    o = await exec(command.trimStart()  + ' ' + text.trimEnd())
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    
    // 2. إرسال المخرجات العادية الناتجة عن نجاح تنفيد الأمر
    if (stdout.trim()) m.reply(stdout)
    
    // 3. إرسال تقرير الأخطاء في حال فشل تنفيذ الأمر في النظام
    if (stderr.trim()) m.reply(stderr)
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['$ [أمر_النظام]']
handler.tags = ['إعدادات متقدمة للمطور']

// تخصيص البادئة المباشرة للأمر لتسهيل الاستدعاء (مثل كتابة $ تليها أمر التيرمنال)
handler.customPrefix = /^[$] /
handler.command = new RegExp

// قفل أمان مطلق: متاح فقط وحصرياً لمالك ومنشئ البوت لحماية السيرفر من الاختراق أو التلف
handler.rowner = true

export default handler
