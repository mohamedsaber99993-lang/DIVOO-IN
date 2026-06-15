import fs from 'fs'
import { promises as fsp } from 'fs'
import archiver from 'archiver'
import path from 'path'

// دالة برمجية مساعدة لتحويل وحساب حجم الملفات بصيغة مفهومة (بايت، كيلوبايت، ميجابايت...)
const formatSize = (bytes) => {
  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

let handler = async (m, { conn }) => {
  const filePath = path.resolve('./database.json')
  const zipPath = path.resolve(`./database-${Date.now()}.zip`)

  try {

    // 1. التحقق من وجود ملف قاعدة البيانات في السيرفر
    await fsp.access(filePath)

    // حساب وقراءة حجم الملف الحالي
    const stats = await fsp.stat(filePath)
    const size = formatSize(stats.size)

    // 2. بدء عملية أرشفة وضغط الملف بصيغة ZIP بأقصى مستوى ضغط (Level 9)
    await new Promise((resolve, reject) => {

      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', resolve)
      archive.on('error', reject)

      archive.pipe(output)
      archive.file(filePath, { name: 'database.json' })
      archive.finalize()

    })

    // 3. إرسال ملف النسخة الاحتياطية المضغوط إلى شات المطور بنجاح
    await conn.sendFile(m.chat, zipPath, 'database.zip', `📦 *نسخة احتياطية لقاعدة البيانات (Backup)*\n📂 الحجم الحالي: ${size}`, m, null, { mimetype: 'application/zip', asDocument: true })

    // 4. حذف الملف المضغوط المؤقت من السيرفر بعد إرساله لتوفير المساحة
    await fsp.unlink(zipPath)

  } catch (err) {

    try {

      // خطة بديلة (Fallback): إذا فشلت عملية الضغط لأي سبب، يتم إرسال ملف قاعدة البيانات مباشرة دون ضغط
      const buffer = await fsp.readFile(filePath)

      await conn.sendFile(m.chat, buffer, 'database.json', '⚠️ تعذر ضغط الملف، جاري إرسال قاعدة البيانات مباشرة بصيغة JSON...', m, null, { mimetype: 'application/json', asDocument: true })

    } catch (e) {
      // إشعار فشل نهائي في حال عدم الوصول للملف برمتها
      await conn.reply(m.chat, '❌ خطأ برمي: فشل جلب واستخراج ملف قاعدة البيانات.', m)
    }

  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['نسخة_قاعدة_البيانات']
handler.tags = ['إعدادات متقدمة للمطور']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['getdb', 'قاعدة_البيانات', 'نسخة_احتياطية', 'الداتابيز']

// قفل أمان مطلق: متاح فقط وحصرياً لمالك ومنشئ البوت (المنشئ الأساسي) لمنع تسريب بيانات المستخدمين
handler.rowner = true

export default handler
