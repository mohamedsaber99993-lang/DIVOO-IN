import fetch from 'node-fetch'

// التعبير النمطي (Regex) للتحقق من صحة رابط جيتهاب واستخراج اسم المستخدم واسم المستودع
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i

let handler = async (m, { conn, args, usedPrefix, command }) => {

    // 1. التحقق من وجود الرابط
    if (!args[0])
        throw `✳️ يرجى إدخال رابط مستودع جيتهاب (GitHub).\n\n📌 مثال على الاستخدام: ${usedPrefix + command} https://github.com/FG98F/dylux-bot`

    // 2. التحقق من مطابقة الرابط للتعبير النمطي للتأكد من أنه رابط جيتهاب حقيقي وصالح
    if (!regex.test(args[0]))
        throw `✳️ يرجى إدخال رابط جيتهاب صحيح وصالح.`

    // استخراج اسم المستخدم (user) واسم المستودع (repo) من الرابط عبر مطابقة النمط
    let [, user, repo] = args[0].match(regex)
    repo = repo.replace(/\.git$/, '') // تنظيف اسم المستودع وإزالة امتداد .git إذا وُجد

    // 3. الاتصال بواجهة جيتهاب الرسمية (GitHub API) لجلب معلومات المستودع
    let api = `https://api.github.com/repos/${user}/${repo}`
    let res = await fetch(api)
    
    // إذا لم يجد خادم جيتهاب هذا المستودع (مستودع خاص أو محذوف) يتم إطلاق خطأ
    if (!res.ok) throw '❌ عذراً، لم يتم العثور على هذا المستودع، قد يكون خاصاً أو الرابط غير صحيح.'
    let json = await res.json()

    // 4. صياغة وعرض إحصائيات المستودع باللغة العربية
    let caption = `
📊 *إحصائيات مستودع Github*

⭐ *النجوم (Stars):* ${json.stargazers_count}
🍴 *التفرعات (Forks):* ${json.forks_count}

📅 *تاريخ الإنشاء:* ${json.created_at.slice(0, 10)}
🔄 *آخر تحديث:* ${json.updated_at.slice(0, 10)}

👤 *المالك (Owner):* ${json.owner.login}
🔗 *رابط الملف الشخصي:* ${json.owner.html_url}
`.trim()

    // 5. توليد رابط التحميل المباشر للمستودع مضغوطاً بصيغة ZIP بناءً على الفرع الافتراضي للمشروع (Default Branch)
    let url = `https://codeload.github.com/${user}/${repo}/zip/refs/heads/${json.default_branch}`
    let filename = `${user}-${repo}.zip`

    // 6. إرسال الملف المضغوط كوثيقة ومستند إلى المحادثة مع الإحصائيات
    await conn.sendFile(m.chat, url, filename, caption, m, false, { mimetype: 'application/zip', asDocument: true })
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['تحميل_جيتهاب']
handler.tags = ['التحميلات / الميديا']
handler.command = ['تحميل_جيتهاب', 'جيتهاب', 'جيت_كلون', 'gitclone', 'github']

handler.diamond = true // استهلاك نقاط الألماس عند تشغيل الأمر

export default handler
