global.rpg = {
  /**
   * دالة لتحديد رتبة ولقب اللاعب بناءً على مستواه (Level)
   * @param {number|string} level مستوى المستخدم الحالي
   * @returns {Object} كائن يحتوي على اسم الرتبة والمستوى الأدنى لها
   */
  role(level) {
    level = parseInt(level) // تحويل المدخل إلى رقم صحيح
    if (isNaN(level)) return { name: '', level: '' } // إرجاع قيم فارغة إذا لم يكن المدخل رقماً صالحاً
    
    // قائمة الرتب والألقاب مرتبة تصاعدياً من المستوى الصفر وحتى المستوى 100
    const role = [
      { name: "مبتدئ 🌟", level: 0 }, 
      { name: "متدرب ⚔️", level: 4 }, 
      { name: "ماهر 🛡️", level: 8 }, 
      { name: "ساحر 🔮", level: 12 }, 
      { name: "بارع 🏅", level: 16 }, 
      { name: "حارس ✨", level: 20 }, 
      { name: "بطل 🏆", level: 24 }, 
      { name: "صنديد 🔥", level: 28 }, 
      { name: "أسطورة 👑", level: 32 }, 
      { name: "خرافي 🌌", level: 36 },
      { name: "حكيم 📜", level: 48 }, 
      { name: "كبير السحرة ⚡", level: 52 }, 
      { name: "عالم 🌌", level: 56 }, 
      { name: "مقدس 🕊️", level: 60 }, 
      { name: "الحاكم الأعلى 🪐", level: 100 }
    ];

    // عكس المصفوفة للبحث من الأعلى إلى الأسفل، لضمان مطابقة أعلى رتبة وصل إليها اللاعب
    return role.reverse().find(role => level >= role.level)
  }
}
