import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
       // تقسيم النص المكتوب لتحديد اسم الحزمة والمؤلف بشكل مخصص (مثال: سياق|بوت)
       let stick = args.join(" ").split("|");
       let f = stick[0] !== "" ? stick[0] : packname;
       let g = typeof stick[1] !== "undefined" ? stick[1] : author;
       
  try { 	
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    
    // 1. التحقق من نوع الميديا المدخلة (ملصق، صورة، أو فيديو)
    if (/webp|image|video/g.test(mime)) {
      // قفل الأمان: تحديد الحد الأقصى للمقاطع المتحركة والفيديو بـ 10 ثوانٍ لمنع تعليق البوت
      if (/video/g.test(mime)) if ((q.msg || q).seconds > 11) return m.reply('❌ الحد الأقصى لطول الفيديو أو الجيف هو 10 ثوانٍ فقط.')
      
      let img = await q.download?.() 
      if (!img) throw `✳️ يرجى الرد على صورة أو مقطع فيديو باستخدام الأمر: *${usedPrefix + command}*`
      let out
      
      try {
        stiker = await sticker(img, false, f, g)
      } catch (e) {
        console.error(e)
      } finally {
        // خطة بديلة (Fallback): إذا فشل إنشاء الملصق مباشرة، يتم رفع الميديا إلى سيرفر مؤقت ثم تحويلها
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img)
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, f, g)
        }
      }
    } else if (args[0]) {
      // 2. التحقق مما إذا كان المستخدم قد أرسل رابطاً مباشراً للصورة بدلاً من رفعها
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
      else return m.reply('❌ الرابط الذي أدخلته غير صالح أو غير مدعوم.')
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    // 3. النتيجة النهائية: إرسال الملصق بنجاح أو عرض رسالة الفشل والتعليمات
    if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    else throw `❌ فشلت عملية تحويل الملصق.\n\nتأكد من إرسال (صورة/فيديو/جيف) أولاً ثم قم بالرد عليها بكتابة الأمر: *${usedPrefix + command}*`
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['ملصق', 'تحويل_ملصق']
handler.tags = ['قسم الملصقات (Stickers)']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['s', 'sticker', 'ملصق', 'ستيكر', 'ستيك'] 

export default handler

// دالة برمجية مساعدة للتأكد من صحة بنية الرابط المدخل ومدى توافقه مع امتدادات الصور
const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
