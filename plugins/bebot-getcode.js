import fs from "fs"
import path from "path"

let handler = async (m, { conn, usedPrefix }) => {

    // قيد اختياري (معطل): لمنع تشغيل الأمر إلا من خلال البوتات الفرعية النشطة
    // if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `✳️ هذا الأمر مخصص فقط لـ *البوتات الفرعية النشطة*`, m)
    
    let basePath = "./bebots" // المسار الرئيسي لمجلد حفظ جلسات البوتات الفرعية

    // التحقق مما إذا كان مجلد الجلسات موجوداً في السيرفر من الأساس
    if (!fs.existsSync(basePath)) {
        return conn.reply(m.chat, "❌ لا توجد أي جلسات محفوظة في السيرفر حالياً.", m)
    }

    let folders = fs.readdirSync(basePath) // قراءة المجلدات الموجودة بالداخل
    let senderNumber = await conn.getNum(m.sender) // جلب رقم هاتف مرسل الأمر لتصفيته

    let carpt = []

    // حلقة تكرارية لفحص ملفات التوثيق داخل كل مجلد ومطابقتها برقم المستخدم
    for (let folder of folders) {
        let folderPath = path.join(basePath, folder)
        let credsPath = path.join(folderPath, "creds.json") // مسار ملف التوثيق (Creds)

        if (!fs.existsSync(credsPath)) continue

        try {
            let creds = JSON.parse(fs.readFileSync(credsPath))
            let botNumber = creds?.me?.id?.split(":")[0] // استخراج رقم البوت الفرعي من ملف التوثيق

            if (!botNumber) continue

            // إذا تطابق رقم البوت المخزن مع رقم المستخدم الحالي الذي يطلب الجلسة
            if (botNumber === senderNumber) {

                // جلب بيانات وتاريخ تعديل المجلد لمعرفة آخر وقت كان نشطاً فيه
                let stat = fs.statSync(folderPath)

                carpt.push({
                    id: folder, // اسم مجلد المعرف الخاص بالجلسة
                    number: botNumber,
                    time: stat.mtimeMs // الوقت بالملي ثانية
                })
            }

        } catch (e) {
            continue // تخطي أي ملف تالف لضمان عدم توقف الفحص
        }
    }

    // إذا لم يجد البوت أي جلسة مسجلة تخص رقم هذا المستخدم
    if (carpt.length === 0) {
        return conn.reply(m.chat, `✳️ أنت لا تمتلك بوت فرعي مسجل في السيرفر حتى الآن.\n\n استخدم الأمر التالي لإنشاء بوتك الفرعي الأول: ${usedPrefix}تنصيب`, m)
    }

    // ترتيب الجلسات لفرز الأحدث والأقرب زمناً في حال امتلك المستخدم أكثر من جلسة
    carpt.sort((a, b) => b.time - a.time)

    let act = carpt[0] // اختيار الجلسة الأحدث

    // صياغة الرسالة التوضيحية باللغة العربية مع إرفاق المعرف والأمر المباشر
    let txt = `
┌─⊷  🤖 البوت الفرعي الخاص بك
▢ 🤖 رابط البوت: wa.me/${act.number}
▢ 📂 معرف الجلسة (ID): ${act.id}
▢ 🔗 أمر إعادة التشغيل الفوري: 
${usedPrefix}صنع_بوت ${act.id}
└──────────────`

    // إرسال البيانات الحساسة (المعرف والأمر) لخاص المستخدم لحمايتها من السرقة أو التخريب
    await conn.reply(m.sender, txt, m)
    // إرسال تأكيد في الشات العام (أو الجروب) لإعلامه بنجاح الإرسال في الخاص
    await conn.reply(m.chat, "✅ تم إرسال معرّف الجلسة والأمر الخاص بك إلى المحادثة الخاصة (الخاص).", m)

    m.react("✅")
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['جلب_المعرف']
handler.tags = ['التبويت / البوتات الفرعية']
handler.command = ['جلب_المعرف', 'المعرف', 'كود_الجلسة', 'getcode', 'code']

export default handler
