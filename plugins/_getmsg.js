export async function all(m) {
    // 1. شروط التصفية والتجاهل الأولي:
    // - تجاهل الرسائل إذا لم تكن قادمة من مستخدم أو مجموعة عادية (تنتهي بـ .net)
    // - تجاهل الرسائل الصادرة من رقم البوت نفسه (m.fromMe)
    // - تجاهل التحديثات القادمة من الحالات/الستوري (status@broadcast)
    if (!m.chat.endsWith('.net') || m.fromMe || m.key.remoteJid.endsWith('status@broadcast')) return
    
    // - تجاهل الرسائل إذا كانت الدردشة محظورة في قاعدة البيانات
    if (global.db.data.chats[m.chat].isBanned) return
    
    // - تجاهل الرسائل إذا كان المستخدم مرسل الرسالة محظوراً (Banned) شخصياً
    if (global.db.data.users[m.sender].banned) return
    
    // - تجاهل الرسائل القادمة من بوتات أخرى تستخدم مكتبة Baileys
    if (m.isBaileys) return

    let msgs = global.db.data.msgs
    
    // 2. التحقق مما إذا كان نص الرسالة الحالي مسجلاً ككلمة مفتاحية (Keyword) في قاعدة البيانات
    if (!(m.text in msgs)) return

    // 3. معالجة الرسالة المخزنة وتحويلها:
    // يتم تحويل النص المحفوظ بصيغة JSON إلى كائن جافا سكريبت مع إعادة بناء ملفات الميديا (البافر) إن وجدت
    let _m = this.serializeM(JSON.parse(JSON.stringify(msgs[m.text]), (_, v) => {
        if (
            v !== null &&
            typeof v === 'object' &&
            'type' in v &&
            v.type === 'Buffer' &&
            'data' in v &&
            Array.isArray(v.data)) {
            return Buffer.from(v.data) // تحويل مصفوفة البيانات إلى بافر أصلي قابل للقراءة كملف ميديا
        }
        return v
    }))

    // 4. إعادة توجيه وإرسال الرسالة المخزنة (سواء كانت نصاً، صوتاً، ملصقاً، أو فيديو) إلى المحادثة الحالية
    await _m.copyNForward(m.chat, true)
}
