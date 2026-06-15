import syntaxerror from 'syntax-error'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

let handler = async (m, _2) => {
  let { conn, usedPrefix, noPrefix, args, groupMetadata } = _2
  let _return
  let _syntax = ''
  let _text = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix
  let old = m.exp * 1
  
  try {
    let i = 15
    let f = {
      exports: {}
    }
    
    // بناء بيئة تشغيل ديناميكية معزولة لتنفيذ السكربت المدخل حياً
    let exec = new (async () => { }).constructor('print', 'm', 'handler', 'require', 'conn', 'Array', 'process', 'args', 'groupMetadata', 'module', 'exports', 'argument', _text)
    
    _return = await exec.call(conn, (...args) => {
      if (--i < 1) return
      console.log(...args)
      return conn.reply(m.chat, format(...args), m)
    }, m, handler, require, conn, CustomArray, process, args, groupMetadata, f, f.exports, [conn, _2])
    
  } catch (e) {
    // جلب وتحديد تفاصيل الخطأ البرمجي في حال فشل التنفيذ
    let err = syntaxerror(_text, 'خطأ في دالة التنفيذ الحية', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: 'module'
    })
    if (err) _syntax = '```' + err + '```\n\n'
    _return = e
  } finally {
    // إرسال تقرير التشغيل أو تفاصيل الخطأ النهائي المنسق إلى المطور
    conn.reply(m.chat, _syntax + format(_return), m)
    m.exp = old
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['> [الكود]', '=> [الكود]']
handler.tags = ['إعدادات متقدمة للمطور']

// تخصيص البادئة المباشرة للأمر لتسهيل الاستدعاء (مثل كتابة > تليها الشيفرة البرمجية)
handler.customPrefix = /^=?> /
handler.command = /(?:)/i

// قفل أمان مطلق: لا يمكن لأي مستخدم أو مشرف تشغيله عدا (مالك ومنشئ البوت الأساسي) لحماية السيرفر
handler.rowner = true

export default handler

// فئة برمجية مخصصة للتحكم في مصفوفة البيانات وتجنب استهلاك موارد السيرفر
class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') return super(Math.min(args[0], 10000))
    else return super(...args)
  }
}
