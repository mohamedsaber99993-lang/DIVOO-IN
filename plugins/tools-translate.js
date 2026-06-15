import { translate } from '@vitalets/google-translate-api'

// تحديد لغة الترجمة الافتراضية (تم تعديلها إلى العربية 'ar')
const defaultLang = 'ar'

let handler = async (m, { args, usedPrefix, command }) => {

    // 1. صياغة رسالة المساعدة والتعليمات باللغة العربية
    let example = `
📌 *مثال على الاستخدام:*

*${usedPrefix + command}* <رمز اللغة> [النص]
*${usedPrefix + command}* en أهلاً بالجميع (للترجمة إلى الإنجليزية)

≡ *قائمة رموز اللغات المدعومة عالمياً:* https://cloud.google.com/translate/docs/languages
`.trim()

    // إذا لم يكتب المستخدم أي شيء ولم يقم بالرد على رسالة، يتم عرض التعليمات
    if (!args.length && !m.quoted) throw example

    let lang = args[0]
    let text = args.slice(1).join(' ')

    // التحقق من رمز اللغة المكون من حرفين (مثل ar, en, fr)، وإذا لم يطابق يتم اعتماد اللغة الافتراضية
    if (!lang || lang.length !== 2) {
        lang = defaultLang
        text = args.join(' ')
    }

    // إذا لم يكتب نصاً ولكنه قام بالرد على رسالة نصية، يتم جلب نص الرسالة المقتبسة
    if (!text && m.quoted?.text) {
        text = m.quoted.text
    }

    if (!text) throw example

    try {
        // 2. استدعاء مكتبة جوجل لترجمة النص مع تفعيل ميزة التصحيح التلقائي للأخطاء الإملائية
        let result = await translate(text, {
            to: lang,
            autoCorrect: true
        }).catch(() => null)

        if (!result || !result.text) {
            throw '❌ حدث خطأ أثناء محاولة ترجمة النص.'
        }

        // 3. إرسال النص المترجم بنجاح داخل قالب الرسائل المتقدم (fwc)
        m.reply(result.text, null, fwc)

    } catch (e) {
        throw example
    }
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['ترجم <الرمز> <النص>']
handler.tags = ['أدوات ومساعدة']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['translate', 'tl', 'trad', 'tr', 'traducir', 'ترجم', 'ترجمة']

export default handler
