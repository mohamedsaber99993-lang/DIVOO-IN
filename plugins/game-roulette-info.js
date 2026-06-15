let handler = async (m, { conn, usedPrefix }) => {

let text = `🎰 *روليت الكازينو*

يمكنك وضع الرهانات في مناطق مختلفة من عجلة الروليت.

📌 *باستخدام الأمر*
${usedPrefix}الروليت <الكمية> <الفِضاء>

💰 *مضاعفات الدفع*

🎯 *x36* → الرقم الدقيق  
• Ej: 7, 12, 30

📦 *x3* → العشرات  
• 1-12  
• 13-24  
• 25-36  

📊 *x3* → الأعمدة  
• 1st  
• 2nd  
• 3rd  

🔢 *x2* → أنصاف  
• 1-18  
• 19-36  

⚖️ *x2* → عن / غريب  
• غريب  
• حتى  

🎨 *x2* → الألوان  
• احمر  
• اسود  

🧪 *أمثلة*
${usedPrefix}الروليت 200 تقريبًا
${usedPrefix}الروليت 600 الجولة الثانية
${usedPrefix}الروليت 500 17
`

let img = "https://i.ibb.co/YjsxJwR/ruleta.png"

await conn.sendFile(m.chat, img, "ruleta.jpg", text, m)
}

handler.help = ["معلومات_الروليت"]
handler.tags = ['الألعاب والتسلية']
handler.command = ['معلومات_الروليت','ruleta-info','info-ruleta']

export default handler