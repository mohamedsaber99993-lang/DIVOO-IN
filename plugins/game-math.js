let handler = async (m, { conn, text, usedPrefix, command, args }) => {

  // تهيئة كائن الألعاب الرياضية داخل جلسة البوت لمنع تداخل الجروبات
  conn.math = conn.math ? conn.math : {}

  // 1. صياغة قائمة مستويات الصعوبة المتاحة باللغة العربية
  let txt = `
🧮 *لعبة العمليات الحسابية والرياضيات*

📊 *مستويات الصعوبة المتاحة:*

🟢 نوب (noob)
🟢 سهل (fácil)
🟡 عادي (normal)
🟠 صعب (difícil)
🔴 خبير (experto)
🔥 محترف (maestro)
💀 خارق (extremo)
☠️ مستحيل (imposible)

📌 *طريقة اللعب:*
اكتب اسم الأمر متبوعاً بمستوى الصعوبة (بالإسبانية أو الإنجليزية كما هي معرفة برمجياً).

*مثال:*
*${usedPrefix + command} normal*
`

  // إذا لم يكتب المستخدم مستوى الصعوبة
  if (!args[0]) throw txt

  let mode = args[0].toLowerCase()
  if (!(mode in modes)) throw txt

  let id = m.chat

  // الحماية البرمجية: منع توليد مسألة جديدة إذا كانت هناك مسألة قائمة لم يتم حلها بعد في المجموعة
  if (id in conn.math) return conn.reply(
    m.chat,
    `⚠️ عذراً، لا تزال هناك مسألة حسابية معلقة لم يتم حلها في هذه المجموعه بعد!`,
    conn.math[id][0]
  )

  // توليد المسألة الحسابية بناءً على المستوى المحدد
  let math = genMath(mode)

  // تخزين بيانات اللعبة وتفعيل مؤقت الوقت التنازلي (SetTimeout)
  conn.math[id] = [
    await conn.reply(
      m.chat,
      `🧠 *قم بحل العملية الحسابية التالية بأسرع ما يمكن:*

❓ *${math.str} = ?*

⏱️ *الوقت المتاح:* ${(math.time / 1000).toFixed(0)} ثانية
💰 *المكافأة:* [ ${math.bonus} ] 🪙 عملة نقدية.`,
      m
    ),
    math,
    4,
    // معالج انتهاء الوقت في حال فشل الأعضاء في الحل
    setTimeout(() => {
      if (conn.math[id]) {
        conn.reply(
          m.chat,
          `⏰ *لأسف، انتهى الوقت المتاح للحل!*

✅ الإجابة الصحيحة كانت: *${math.result}*`,
          conn.math[id][0]
        )
        delete conn.math[id] // مسح اللعبة من الذاكرة لإتاحة اللعب مجدداً
      }
    }, math.time)
  ]

}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['رياضيات [المستوى]']
handler.tags = ['الألعاب والتسلية']

// مصفوفة الاختصارات والكلمات المفتاحية للأمر باللغتين العربية والإنجليزية
handler.command = ['احسب', 'رياضيات', 'حساب', 'mates', 'mate', 'math', 'matemáticas']

export default handler

// 2. مصفوفة مستويات الصعوبة مع محددات الأرقام [الحد الأدنى، الحد الأعلى، العمليات، الوقت، الجائزة]
let modes = {
  noob:      [-5, 5,  -5, 5,  '+-',    20000,  50],
  fácil:     [-10, 10, -10, 10, '+-',   20000,  100],
  normal:    [-30, 30, -30, 30, '+-*',  30000,  250],
  difícil:   [-80, 80, -80, 80, '+-*',  35000,  400],
  experto:   [-150, 150, -150, 150, '+-*/', 40000,  700],
  maestro:   [-300, 300, -300, 300, '+-*/', 45000,  1000],
  extremo:   [-500, 500, -500, 500, '+-*/', 50000,  1500],
  imposible: [-1000, 1000, -1000, 1000, '*/', 60000,  2000]
}

// تبديل معامِلات لغة البرمجة إلى رموز رياضية عربية واضحة للمستخدمين
let operators = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷'
}

/**
 * دالة توليد وهندسة المسائل الحسابية عشوائياً وضمان عدم وجود كسور عشريّة
 */
function genMath(mode) {
  let [a1, a2, b1, b2, ops, time, bonus] = modes[mode]

  let a = randomInt(a1, a2)
  let b = randomInt(b1, b2)

  let op = pickRandom([...ops])

  // حماية هندسية: تجنب خروج نتائج بكسور عشرية طويلة عند حدوث عمليات القسمة
  if (op == '/') {
    b = randomInt(1, 10)
    a = b * randomInt(1, 20) // جعل البسط مضاعفاً للمقام لتكون النتيجة دائماً رقماً صحيحاً
  }

  // حساب النتيجة برمجياً عبر منشئ الدوال الحركي الفوري
  let result = new Function(`return ${a} ${op} ${b}`)()

  return {
    str: `${a} ${operators[op]} ${b}`,
    mode,
    time,
    bonus,
    result
  }
}

/**
 * دالة توليد رقم عشوائي صحيح محصور بين قيمتين محددتين
 */
function randomInt(from, to) {
  if (from > to) [from, to] = [to, from]
  from = Math.floor(from)
  to = Math.floor(to)
  return Math.floor((to - from) * Math.random() + from)
}

/**
 * دالة الاختيار العشوائي من المصفوفات
 */
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

handler.modes = modes
