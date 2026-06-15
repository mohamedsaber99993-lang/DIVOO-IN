import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
         // 1. تسجيل التوقيت الزمني لبدء الاختبار
         let timestamp = speed();
         
         // حساب الفارق الزمني الدقيق بالملي ثانية لقياس سرعة الاستجابة
         let latensi = speed() - timestamp;
         
         // 2. استدعاء أمر النظام neofetch لجلب مواصفات السيرفر المضيف
         exec(`neofetch --stdout`, (error, stdout, stderr) => {
          let child = stdout.toString("utf-8");
          
          // استبدال المصطلحات البرمجية لتكون أكثر وضوحاً للمستخدم
          let ssd = child.replace(/Memory:/, "الذاكرة العشوائية (Ram):");
          
          // 3. إرسال نتيجة الفحص وسرعة البينج باللغة العربية
          m.reply(`🟢 *سرعة استجابة السيرفر (Ping):* ${latensi.toFixed(4)} _ملي ثانية_`, null, "");
            });
}

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها لسهولة الوصول من المنيو العربي
handler.help = ['بينج']
handler.tags = ['الرئيسية والمعلومات']

// مصفوفة الكلمات المفتاحية والاختصارات للأمر باللغتين العربية والإنجليزية
handler.command = ['بينج', 'بينغ', 'سرعة', 'السرعة', 'ping', 'speed']

export default handler
