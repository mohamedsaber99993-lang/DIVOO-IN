import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * رفع ملف مؤقت إلى سيرفر file.io
 * `تنتهي صلاحية الرابط بعد يوم واحد فقط (1d)`
 * `الحد الأقصى لحجم الملف هو 100 ميجابايت`
 * @param {Buffer} buffer بافر الملف
 */
const fileIO = async buffer => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  let form = new FormData()
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime })
  form.append('file', blob, 'tmp.' + ext)
  
  // إرسال الطلب إلى السيرفر مع تحديد مدة الصلاحية بيوم واحد
  let res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form
  })
  let json = await res.json()
  if (!json.success) throw json
  return json.link // إرجاع رابط الملف المرفوع
}

/**
 * رفع ملف إلى سيرفر storage.restfulapi.my.id
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} inp بافر الملف، ممر التدفق، أو مصفوفة تحتوي عليهم
 * @returns {string|null|(string|null)[]}
 */
const RESTfulAPI = async inp => {
  let form = new FormData()
  let buffers = inp
  // إذا لم يكن المدخل مصفوفة، يتم تحويله إلى مصفوفة أحادية لتوحيد عملية المعالجة
  if (!Array.isArray(inp)) buffers = [inp]
  for (let buffer of buffers) {
    const blob = new Blob([buffer.toArrayBuffer()])
    form.append('file', blob)
  }
  let res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form
  })
  let json = await res.text()
  try {
    json = JSON.parse(json)
    // إذا كان المدخل ملفاً واحداً، يتم إرجاع رابط الملف الأول مباشرة
    if (!Array.isArray(inp)) return json.files[0].url
    // إذا كان المدخل مصفوفة ملفات، يتم عمل خريطة (Map) لإرجاع روابط جميع الملفات المرفوعة
    return json.files.map(res => res.url)
  } catch (e) {
    throw json
  }
}

/**
 * الدالة الافتراضية الرئيسية: تحاول رفع الميديا وتستخدم نظام البدائل (Fallback) في حال تعطل أحد السيرفرات
 * @param {Buffer} inp بافر الميديا المراد رفعها
 * @returns {Promise<string>} رابط الميديا المرفوعة
 */
export default async function (inp) {
  let err = false
  // المحاولة بالتتابع: يبدأ بسيرفر RESTfulAPI أولاً، وفي حال فشله ينتقل إلى سيرفر fileIO
  for (let upload of [RESTfulAPI, fileIO]) {
    try {
      return await upload(inp)
    } catch (e) {
      err = e
    }
  }
  if (err) throw err
}
