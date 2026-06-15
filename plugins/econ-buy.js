// إعداد الأسعار الافتراضية لعناصر المتجر (يمكنك تعديلها حسب رغبتك)
let precioDiamante = 200;      // سعر الماسة الواحدة = 200 عملة نقدية
let precioPremiumHora = 50;    // سعر ساعة البريميوم الواحدة = 50 ماسة
let precioPremiumDia = 800;    // سعر يوم البريميوم الواحد = 800 ماسة

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  
  // 1. التحقق من إدخال البيانات: إذا لم يحدد المستخدم العناصر يظهر له دليل الاستخدام
  if (!args[1]) throw `📌 *طريقة استخدام المتجر:*\n\n*${usedPrefix + command}* [رقم_العنصر] [الكمية]\nمثال لشراء ألماس: *${usedPrefix + command}* 01 5\nمثال لشراء بريميوم: *${usedPrefix + command}* 02 4d\n\n💡 اكتب *${usedPrefix}shop* لعرض قائمة المنتجات المتوفرة.`;

  let option = args[0]; // معرف المنتج (01 أو 02)
  let input = args[1];  // الكمية المطلوبة
  let user = global.db.data.users[m.sender]; // جلب بيانات الحساب الشخصي من قاعدة البيانات

  // ==========================================
  // [المنتج رقم 01: متجر شراء الألماس 💎]
  // ==========================================
  if (option === '01') {
    let sca = args[1];
    // التحقق من أن المدخل رقم صحيح أو كلمة 'all' لشراء الحد الأقصى المسموح
    if (sca.toLowerCase() !== 'all' && !/^[1-9]\d*$/.test(sca)) throw `✳️ خطأ: يجب إدخال كمية رقمية صالحة وصحيحة.`;

    // حساب أقصى كمية ألماس يمكن للمستخدم شراؤها بناءً على رصيد عملاته الحالي
    let all = Math.floor(user.coin / precioDiamante)
    let count = sca.replace('all', all)
    count = Math.max(1, count) // ضمان ألا تقل الكمية المطلوبة عن 1
    
    // حساب التكلفة الإجمالية للعملية
    let totalCost = precioDiamante * count;

    // فحص ما إذا كان المستخدم يملك ثمن الشراء
    if (user.coin >= totalCost) {
      user.coin -= totalCost;  // خصم العملات النقدية
      user.diamond += count;   // إضافة الألماس المشترى

      // إرسال فاتورة إيصال الشراء باللغة العربية
      m.reply(`
┌─「 *🧾 إيصال عملية شراء* 」
‣ *المنتج:* ألماس 💎
‣ *الكمية المشتراة:* ${count.toLocaleString()}
‣ *المبلغ المخصوم:* -${totalCost.toLocaleString()} عملة 🪙
└───────────────────`, null, fwc);
    } else {
      m.reply(`❎ عذراً، ليس لديك رصيد كافٍ من العملات لشراء *${count}* من الألماس.`, null, fwc);
    }

  // ==========================================
  // [المنتج رقم 02: متجر العضوية المميزة البريميوم ✨]
  // ==========================================
  } else if (option === '02') {
    let count = 0;
    let unit = '';

    // تحليل المدخلات الزمنية: الساعات (h) أو الأيام (d)
    if (input.endsWith('h')) {
      count = parseInt(input.slice(0, -1));
      unit = 'ساعات';
    } else if (input.endsWith('d')) {
      count = parseInt(input.slice(0, -1));
      unit = 'أيام';
    } else {
      throw `✳️ صيغة الوقت غير صحيحة.\n\n*مثال على الشراء المالي المستقر:*\n${usedPrefix + command} 02 4d (تعني شراء 4 أيام بريميوم)\n\n*الدلالات الزمنية:*\n*h* = ساعة\n*d* = يوم`;
    }

    // التحقق من أن الوقت المستقطع عبارة عن رقم إيجابي صلب
    if (!/^[1-9]\d*$/.test(count)) throw `✳️ خطأ: الكمية الزمنية المحددة يجب أن تكون رقماً صالحاً.`;

    let precioPremium = 0;

    // حساب التكلفة الإجمالية بالألماس بناءً على الوحدة الزمنية المحددة
    if (unit === 'ساعات') {
      precioPremium = precioPremiumHora * count;
    } else if (unit === 'أيام') {
      precioPremium = precioPremiumDia * count;
    }

    // فحص رصيد الألماس المتوفر لدى المستخدم
    if (user.diamond >= precioPremium) {
      user.diamond -= precioPremium; // خصم الألماس
      let horas = 0;

      // تحويل المدخلات إلى توقيتات حية بالملي ثانية (Milliseconds) لإضافتها للخادم
      if (unit === 'ساعات') {
        horas = count * 3600000;      // الساعة = 3.6 مليون مللي ثانية
      } else if (unit === 'أيام') {
        horas = count * 86400000;     // اليوم = 86.4 مليون مللي ثانية
      }

      const now = new Date() * 1; // جلب الطابع الزمني الحالي حياً بالملي ثانية

      // هندسة التمديد التراكمي: إذا كان المستخدم يمتلك بريميوم حالياً يتم تمديد الوقت فوق وقته السابق، وإلا يتم الحساب من اللحظة الحالية
      if (now < user.premiumTime) {
        user.premiumTime += horas;
      } else {
        user.premiumTime = now + horas;
      }

      user.prem = true; // تفعيل مفتاح حساب البريميوم برمجياً

      // إرسال فاتورة إيصال شراء العضوية المميزة باللغة العربية
      m.reply(`
┌─「 *🧾 إيصال عملية شراء* 」
‣ *المنتج:* العضوية المميزة (Premium) ✨
‣ *المدة الزمنية:* ${count} ${unit}
‣ *المبلغ المخصوم:* -${precioPremium} ماسة 💎
└───────────────────`, null, fwc);
    } else {
      m.reply(`❎ عذراً، لا تمتلك رصيداً كافياً من الألماس لشراء مدة قدرها ${count} ${unit} من العضوية المميزة.`, null, fwc);
    }
  } else {
    // في حال إدخال رمز منتج غير معرف بالمتجر
    throw `✳️ هذا المنتج غير متوفر في المتجر حالياً.\n\nاكتب *${usedPrefix}shop* لمراجعة قائمة السلع المدعومة.`;
  }

};

// إعدادات المساعدة والتصنيف للأمر بعد تعريبها
handler.help = ['شراء']
handler.tags = ['الاقتصاد / العاب RPG']
handler.command = ['شراء', 'buy']

export default handler;
