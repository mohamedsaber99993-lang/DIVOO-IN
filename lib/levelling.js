// حراسة رياضية تعتمد على الثوابت الرياضية (ط والعدد النيبيري والنسبة الذهبية) لتوليد منحنى نمو متناسق للمستويات
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * .75

/**
 * حساب نطاق نقاط الخبرة (XP) المطلوب لمستوى معين
 * @param {Number} level المستوى المراد فحص نطاقه
 * @param {Number} multiplier مضاعف الخبرة الافتراضي من الإعدادات العامة
 * @returns {{min: Number, max: Number, xp: Number}} الحد الأدنى، الحد الأعلى، والصافي المطلوب للمستوى
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
    if (level < 0)
        throw new TypeError('لا يمكن أن يكون المستوى قيمة سالبة!')
        
    level = Math.floor(level)
    
    // معادلة حساب الحد الأدنى والحد الأعلى لنقاط الخبرة بناءً على منحنى النمو الرياضي
    let min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
    let max = Math.round(Math.pow(++level, growth) * multiplier)
    
    return {
        min, // الحد الأدنى لبداية المستوى
        max, // الحد الأقصى لنهاية المستوى
        xp: max - min // صافي نقاط الخبرة المطلوبة لتخطي هذا المستوى بالكامل
    }
}

/**
 * معرفة المستوى الحالي للمستخدم بناءً على إجمالي نقاط الخبرة (XP) التي يمتلكها
 * @param {Number} xp إجمالي نقاط الخبرة الحالية
 * @param {Number} multiplier مضاعف الخبرة
 * @returns {Number} رقم المستوى الحالي
 */
export function findLevel(xp, multiplier = global.multiplier || 1) {
    if (xp === Infinity)
        return Infinity
    if (isNaN(xp))
        return NaN
    if (xp <= 0)
        return -1
        
    let level = 0
    // حلقة تكرارية تفحص المستويات صعوداً حتى تجد النطاق المناسب لنقاط المستخدم
    do
        level++
    while (xpRange(level, multiplier).min <= xp)
    
    return --level
}

/**
 * التحقق مما إذا كان المستخدم يمتلك نقاط خبرة كافية لرفع مستواه (Level Up)
 * @param {Number} level المستوى الحالي للمستخدم
 * @param {Number} xp إجمالي نقاط الخبرة الحالية للمستخدم
 * @param {Number} multiplier مضاعف الخبرة
 * @returns {Boolean} القيمة المنطقية (نعم / لا)
 */
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
    if (level < 0)
        return false
    if (xp === Infinity)
        return true
    if (isNaN(xp))
        return false
    if (xp <= 0)
        return false
        
    // يعيد true إذا كان مستوى المستخدم الحالي أصغر من المستوى الفعلي الذي تؤهله له نقاطه
    return level < findLevel(xp, multiplier)
}
