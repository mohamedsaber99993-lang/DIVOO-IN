import { tmpdir } from 'os'
import path, { join } from 'path'
import fs from 'fs'
import { readdirSync, unlinkSync, rmSync } from 'fs'

let handler = async (m, { conn, __dirname, args }) => {

  // 1. إرسال رسالة التأكيد المبدئية باللغة العربية وتفعيل إيموجي الإتمام
  m.reply(`✅ تم بنجاح تنظيف والمصادقة على مجلدات الملفات المؤقتة والجلسات المتراكمة *tmp + sessions*`)
  m.react(done)
   
  // -- قسم تنظيف وحذف الملفات المؤقتة (TMP) ---
  const tmpDirs = [tmpdir(), join(__dirname, '../tmp')]
  const tmpFiles = []
  tmpDirs.forEach((dir) => readdirSync(dir).forEach((file) => tmpFiles.push(join(dir, file))))
  tmpFiles.forEach((file) => {
    const filePath = file
    if (fs.lstatSync(filePath).isDirectory()) {
      rmSync(filePath, { recursive: true, force: true })
    } else {
      unlinkSync(filePath)
    }
  })

  // -- قسم تنظيف ملفات جلسات البوت المتراكمة ---
  const Sessions = "./sessions"
  readdirSync(Sessions).forEach((file) => {
    const filePath = `${Sessions}/${file}`
    if (file !== 'creds.json') { // الحفاظ على ملف الاتصال الأساسي حتى لا ينفصل البوت
      if (fs.lstatSync(filePath).isDirectory()) {
        rmSync(filePath, { recursive: true, force: true })
      } else {
        unlinkSync(filePath)
      }
    }
  })

  // -- قسم فحص وصيانة البوتات الفرعية (Sub-Bots) ---
  const bots = './bebots'
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000 // تحديد مهلة زمنية قدرها أسبوع واحد (بالملي ثانية)

  if (fs.existsSync(bots)) {
    for (let dir of fs.readdirSync(bots)) {
      let botPath = join(bots, dir)
      let credsPath = join(botPath, 'creds.json')

      try {
        if (!fs.existsSync(botPath)) continue

        // ❌ إذا لم تتوفر ملفات الاعتماد (creds) -> يتم حذف مجلد البوت بالكامل
        if (!fs.existsSync(credsPath)) {
          fs.rmSync(botPath, { recursive: true, force: true })
          continue
        }

        // 🧠 فحص مؤشر النشاط الزمني للبوت الفرعي
        let stat = fs.statSync(credsPath)
        let isOld = (Date.now() - stat.mtimeMs) > ONE_WEEK

        // ⏳ في حال كان البوت خامل وغير نشط لأكثر من أسبوع -> يتم حذفه لتوفير مساحة السيرفر
        if (isOld) {
          fs.rmSync(botPath, { recursive: true, force: true })
          continue
        }

        // 🔧 إذا كان البوت نشطاً -> يتم تنظيف ملفاته المؤقتة وفضلاتها باستثناء ملف الاتصال
        for (let file of fs.readdirSync(botPath)) {
          if (file === 'creds.json') continue

          let filePath = join(botPath, file)

          try {
            if (fs.lstatSync(filePath).isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true })
            } else {
              fs.unlinkSync(filePath)
            }
          } catch {}
        }

      } catch {}
    }
  }
  
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تنظيف_المؤقت']
handler.tags = ['أوامر المطور والمشرف']

// التعبير النمطي للمصفوفة البرمجية لدعم الكلمات العربية والإنجليزية بالتبادل
handler.command = /^(cleartmp|تنظيف|تنظيف_المؤقت|حذف_المؤقت)$/i

// قفل الأمان: متاح فقط لمالك ومطور البوت الأساسي (المنشئ)
handler.rowner = true

export default handler
