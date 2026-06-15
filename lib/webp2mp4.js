import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { JSDOM } from 'jsdom';

/**
 * تحويل ملف WebP (ملصق متحرك) إلى مقطع فيديو MP4
 * @param {Buffer|String} source بافر الملف أو رابط مباشر للصورة
 * @returns {Promise<string>} رابط الويب المباشر لمقطع الفيديو الناتجة
 */
async function webp2mp4(source) {
  let form = new FormData()
  // التحقق مما إذا كان المدخل عبارة عن رابط ويب (URL) أم بافر ملف (Buffer)
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
  const blob = !isUrl && new Blob([source.toArrayBuffer()])
  
  // تجهيز النموذج بناءً على نوع المدخلات وإرساله إلى خادم Ezgif
  form.append('new-image-url', isUrl ? source : '')
  form.append('new-image', isUrl ? '' : blob, 'image.webp')
  
  let res = await fetch('https://s6.ezgif.com/webp-to-mp4', {
    method: 'POST',
    body: form
  })
  
  let html = await res.text()
  let { document } = new JSDOM(html).window
  let form2 = new FormData()
  let obj = {}
  
  // استخراج حقول التحقق الخفية (Hidden Inputs) والمعاملات التي يولدها الموقع تلقائياً
  for (let input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value
    form2.append(input.name, input.value)
  }
  
  // إرسال طلب المعالجة والتحويل الفعلي للملف
  let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
    method: 'POST',
    body: form2
  })
  
  let html2 = await res2.text()
  let { document: document2 } = new JSDOM(html2).window
  
  // كشط وتحليل وسم الفيديو (Video Source) واستخراج الرابط النهائي المباشر للملف
  return new URL(document2.querySelector('div#output > p.outfile > video > source').src, res2.url).toString()
}

/**
 * تحويل ملف WebP (ملصق ثابت أو متحرك) إلى صورة PNG
 * @param {Buffer|String} source بافر الملف أو رابط مباشر للصورة
 * @returns {Promise<string>} رابط الويب المباشر للصورة الناتجة
 */
async function webp2png(source) {
  let form = new FormData()
  // التحقق مما إذا كان المدخل عبارة عن رابط ويب (URL) أم بافر ملف (Buffer)
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
  const blob = !isUrl && new Blob([source.toArrayBuffer()])
  
  form.append('new-image-url', isUrl ? source : '')
  form.append('new-image', isUrl ? '' : blob, 'image.webp')
  
  let res = await fetch('https://s6.ezgif.com/webp-to-png', {
    method: 'POST',
    body: form
  })
  
  let html = await res.text()
  let { document } = new JSDOM(html).window
  let form2 = new FormData()
  let obj = {}
  
  // استخراج حقول التحقق الخفية (Hidden Inputs) والمعاملات التي يولدها الموقع تلقائياً
  for (let input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value
    form2.append(input.name, input.value)
  }
  
  // إرسال طلب التحويل إلى صورة ثابتة
  let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
    method: 'POST',
    body: form2
  })
  
  let html2 = await res2.text()
  let { document: document2 } = new JSDOM(html2).window
  
  // كشط وتحليل وسم الصورة (Image Tag) المخرجة وجلب رابط الـ PNG المباشر
  return new URL(document2.querySelector('div#output > p.outfile > img').src, res2.url).toString()
}

// تصدير الدوال البرمجية لاستخدامها في ملفات الأوامر (Commands)
export {
  webp2mp4, 
  webp2png
}
