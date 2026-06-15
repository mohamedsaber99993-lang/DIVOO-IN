import { createHash } from 'crypto'

// التعبير النمطي (Regex) للتحقق من صياغة المدخلات وفصلها باستخدام علامة + أو |
const REGEX = /^\s*([^+|]+?)\s*[\+|]\s*([0-9]{1,3})\s*[\+|]\s*([MFN])\s*$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {

  let user = global.db.data.users[m.sender] || {}

  // 1. التحقق الاستباقي: التأكد مما إذا كان المستخدم مسجلاً بالفعل في قاعدة البيانات
  if (user.registered) throw `✅ أنت مسجل بالفعل في نظام البوت.\n\nاستخدم الأمر التالي لحذف تسجيلك الحالي:\n*${usedPrefix}unreg <الرمز_التسلسلي>*`
  

  text = (text || '').trim()

  // رسالة المساعدة والإرشاد لشرح طريقة التسجيل الصحيحة
  const ayuda = `📌 *صيغة الإدخال غير صحيحة*

👉 يرجى استخدام الأمر بالشكل التالي:
*${usedPrefix + command} الاسم+العمر+الجنس*

📍 *مثال توضيحي:*
*${usedPrefix + command} أحمد+20+M*

📋 *رموز تحديد الجنس المتاحة:*
- *M* ← ذكر / رجل
- *F* ← أنثى / امرأة
- *N* ← آخر / غير ذلك`

  // التحقق من مطابقة النص المدخل للتعبير النمطي لضمان دقة البيانات
  if (!REGEX.test(text)) throw ayuda

  const match = text.match(REGEX)
  if (!match) throw ayuda

  let [, nombre, edadRaw, generoRaw] = match

  // تنظيف الاسم من الرموز الخاصة والتعبيرات الغريبة وحفظ الحروف والأرقام فقط
  nombre = nombre.replace(/[^\p{L}\p{N} ]/gu, '').trim()

  if (!nombre) throw '❌ لا يمكن أن يكون حقل الاسم فارغاً.'
  if (nombre.length > 30) throw '❌ الاسم طويل جداً (الحد الأقصى هو 30 حرفاً).'

  // 2. التحقق من صحة وملاءمة العمر المدخل
  let edad = parseInt(edadRaw)

  if (isNaN(edad)) throw '❌ يجب أن يكون حقل العمر عبارة عن رقم صحيح عادياً.'
  if (edad < 10) throw '🚼 عذراً، يجب أن يكون عمرك 10 سنوات على الأقل للتسجيل واستخدام البوت.'
  if (edad > 60) throw '👴 عذراً، هذا العمر خارج النطاق المسموح به للتسجيل.'

  // 3. التحقق من الجنس وتعيين الملصق المناسب باللغة العربية
  let generoKey = generoRaw.toUpperCase()

  const generos = {
    M: '🙆🏻‍♂️ ذكر',
    F: '🤵🏻‍♀️ أنثى',
    N: '⚧ آخر'
  }

  const genero = generos[generoKey]

  if (!genero) {
    throw `❌ رمز تحديد الجنس غير صالح.

يرجى استخدام الرموز التالية فقط:
- M (ذكر)
- F (أنثى)
- N (آخر)`
  }

  // جلب صورة الحساب الشخصية للمستخدم من واتساب، وفي حال عدم وجودها يتم تعيين صورة افتراضية
  let foto = await conn.profilePictureUrl(m.sender, 'image').catch(() => './src/avatar_contact.png')

  // 4. توليد رمز تسلسلي فريد وتشفيره لحماية ملف المستخدم برمجياً
  const serial = createHash('md5').update(m.sender).digest('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)

  // 5. حفظ البيانات المستخرجة وتحديث حالة المستخدم في قاعدة البيانات
  user.name = nombre
  user.age = edad
  user.genero = genero
  user.regTime = Date.now()
  user.registered = true

  global.db.data.users[m.sender] = user

  // صياغة كرت التسجيل النهائي والترحيب بالمستخدم باللغة العربية
  const mensaje = `
┌─「 ✅ تم التسجيل بنجاح 」─
▢ 👤 الاسم: ${nombre}
▢ 🎂 العمر: ${edad} سنة
▢ ⚧ الجنس: ${genero}
▢ 🔑 الرمز التسلسلي: ${serial}
└──────────────`.trim()

  // إرسال كرت التسجيل مرفقاً بصورة الملف الشخصي للمستخدم
  await conn.sendFile(m.chat, foto, 'registro.jpg', mensaje, m)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['تسجيل <الاسم+العمر+الجنس>']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['reg', 'register', 'registrar', 'verify', 'تسجيل', 'سجل', 'التحقق', 'تفعيل']

export default handler
