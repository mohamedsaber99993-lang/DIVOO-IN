import speed from 'performance-now'

let handler = async (m, { conn, usedPrefix, command }) => {
    let start = speed()
    let uptime = await getUptime()
    let end = speed()
    
    // حساب معدل التأخير (البينج) بدقة وتثبيته على 4 أرقام عشرية
    let latency = (end - start).toFixed(4)

    // حساب إجمالي عدد الأوامر المتاحة والمفعلة داخل ملفات النظام
    let cmds = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    let totalreg = Object.keys(global.db.data.users)
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true)

    // صياغة لوحة البيانات والتقرير الإحصائي باللغة العربية
    let message = `
 ≡ *حالة النظام (STATUS)*
- *سرعة الاستجابة (Ping):* ${latency} _ملي ثانية_
- *مدة التشغيل (Uptime):* ${uptime}
- *إجمالي الأوامر المتوفرة:* ${cmds} أمر

*≡ إحصائيات مستخدمي البوت*
- *إجمالي الحسابات:* ${totalreg.length.toLocaleString()}
- *المستخدمين المسجلين رسمياً:* ${rtotalreg.length.toLocaleString()} 

*≡ مطور البوت والمطورين (OWNER)*
  *𝐃𝐄𝐕 𝐀𝐁𝐎𝐎𝐃𝐈 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋*
▢ *إنستغرام :*
- ${fg_ig}
▢ *تيك توك :*
- ${fg_tt}
▢ *تيليجرام :*
- t.me/fg_userss (المجموعة الرسمية)
▢ *يوتيوب :*
- غير متتح حالياً `

    // إرسال لوحة البيانات المنسقة مع قالب اقتباس الرسائل المتقدم (fwc)
    m.reply(message, null, fwc)
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['معلومات_البوت']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['معلومات', 'المعلومات', 'حالة_البوت', 'الحالة', 'info', 'infobot', 'botinfo']

export default handler

// دالة برمجية مساعدة لجلب مدة تشغيل النظام الحية من معالج السيرفر
async function getUptime() {
    if (process.send) {
        process.send('uptime')
        let _muptime = await new Promise(resolve => {
            process.once('message', resolve)
            setTimeout(() => resolve(0), 1000)
        });
        return formatUptime(_muptime * 1000)
    }
    return formatUptime(0)
}

// دالة برمجية مساعدة لتحويل الملي ثانية إلى صيغة زمنية مفهومة (أيام، ساعات، دقائق، ثوانٍ)
function formatUptime(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${d} يوم و ${h} ساعة و ${m} دقيقة و ${s} ثانية`
}
