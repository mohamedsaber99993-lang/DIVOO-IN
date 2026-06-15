// مصفوفة روابط الويب لصور أوجه النرد الستة المتاحة
const da = [
  'https://tinyurl.com/gdd01',
  'https://tinyurl.com/gdd02',
  'https://tinyurl.com/gdd003',
  'https://tinyurl.com/gdd004',
  'https://tinyurl.com/gdd05',
  'https://tinyurl.com/gdd006'
];

let handler = async (m, { conn }) => {
  // اختيار رابط نرد عشوائي وإرساله فوراً إلى المحادثة كملصق أو صورة بصيغة dado.webp
  conn.sendFile(m.chat, pickRandom(da), 'dado.webp', '', m)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['نرد']
handler.tags = ['الألعاب والتسلية']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['نرد', 'النرد', 'زهر', 'حظ', 'dado', 'dados'] 

export default handler

/**
 * دالة برمجية مساعدة لاختيار عنصر واحد بشكل عشوائي تماماً من مصفوفة معينة
 * @param {Array} list مصفوفة الروابط
 * @returns {string} رابط وجه النرد المختار عشوائياً
 */
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
