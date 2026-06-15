import fg from 'fg-senna'
import axios from "axios"

let handler = async (m, { conn, text }) => {
  // 1. التحقق الاستباقي: إذا لم يقم المستخدم بكتابة اسم الحزمة المراد البحث عنها
  if (!text) throw '✳️ يرجى إدخال اسم حزمة NPM المراد البحث عنها.'

  let img = 'https://i.ibb.co/HxNbmxd/npm2.png'
  
  // وضع تفاعل الانتظار الافتراضي (rwait)
  m.react(rwait)

  try {
    // استدعاء الدالة المساعدة لجلب بيانات الحزمة من مستودع NPM الرسمي
    let pkg = await npm(text)

    // 2. صياغة كرت معلومات الحزمة باللغة العربية
    let caption = `
▢ *اسم الحزمة:* ${pkg.name}
▢ *الإصدار الأخير:* ${pkg.version}
▢ *المطور/المالك:* ${pkg.owner || 'غير معروف'}
▢ *تاريخ النشر:* ${pkg.publishedDate ? new Date(pkg.publishedDate).toLocaleDateString('ar-EG') : 'غير متوفر'}
▢ *الوصف:* ${pkg.description || 'لا يوجد وصف متوفر'}
▢ *الصفحة الرئيسية:* ${pkg.homepage || 'غير متوفر'}
▢ *رابط الحزمة:* ${pkg.packageLink}
`.trim()

    // إرسال كرت المعلومات مرفقاً بالشعار الافتراضي للمستودع
    await conn.sendFile(m.chat, img, 'npm.png', caption, m)

    // 3. تحميل ملف الحزمة البرمجية المضغوط وإرساله للمستخدم كمستند جاهز للتركيب
    await conn.sendFile(
      m.chat,
      pkg.downloadLink,
      `${pkg.packageName}-${pkg.version}.tgz`,
      '',
      m,
      null,
      { mimetype: 'application/zip', asDocument: true }
    )

    // وضع تفاعل الإتمام (done) بعد نجاح العملية بالكامل
    m.react(done)

  } catch (err) {
    // إدارة الأخطاء في حال عدم وجود الحزمة أو حدوث خطأ في الاتصال
    m.reply(`✳️ خطأ: تعذر العثور على الحزمة المطلوبة أو أن الاسم غير صحيح.`)
  }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['مكتبة_npm <اسم الحزمة>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['npm', 'npmdl', 'npmsearch', 'مكتبة', 'حزمة']

export default handler

// دالة برمجة مساعدة للاستعلام من الـ API الرسمي لموقع npmjs.org
async function npm(query) {
  try {

    const response = await axios.get(`https://registry.npmjs.org/${query}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    })

    const data = response.data
    const name = data.name
    const description = data.description
    const version = data['dist-tags'].latest

    const packageLink = `https://www.npmjs.com/package/${name}`

    const lastSlashIndex = name.lastIndexOf('/')
    const packageName = lastSlashIndex !== -1
      ? name.substring(lastSlashIndex + 1)
      : name

    // صياغة الرابط المباشر لتحميل ملف السورس كود الخاص بالإصدار الأخير
    const downloadLink = `https://registry.npmjs.org/${name}/-/${packageName}-${version}.tgz`

    const owner = data.maintainers?.[0]?.name || null
    const homepage = data.homepage || null
    const license = data.license || null
    const dependencies = data.versions?.[version]?.dependencies || {}

    const publishedDate = data.time?.[version] || null

    return {
      name,
      description,
      version,
      packageLink,
      packageName,
      downloadLink,
      publishedDate,
      owner,
      homepage,
      license,
      dependencies
    }

  } catch (err) {
    throw new Error(err.message)
  }
}
