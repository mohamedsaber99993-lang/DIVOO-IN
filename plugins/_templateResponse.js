const {
    proto,
    generateWAMessage,
    areJidsSameUser
} = (await import('@whiskeysockets/baileys')).default

export async function all(m, chatUpdate) {
    if (m.isBaileys) return // تجاهل الرسائل القادمة من البوتات الأخرى
    if (!m.message) return // تجاهل الرسائل الفارغة
    
    // التحقق مما إذا كانت الرسالة عبارة عن رد على زر تفاعلي، قالب أزرار، قائمة خيارات، أو أزرار التدفق الجديد
    if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage || m.message.interactiveResponseMessage)) {
        return
    }
  
    let id
    // استخراج المعرّف الفريد (ID) الخاص بالزر أو الخيار الذي تم الضغط عليه بناءً على نوع الزر
    if (m.message.buttonsResponseMessage) {
        id = m.message.buttonsResponseMessage.selectedButtonId
    } else if (m.message.templateButtonReplyMessage) {
        id = m.message.templateButtonReplyMessage.selectedId
    } else if (m.message.listResponseMessage) {
        id = m.message.listResponseMessage.singleSelectReply?.selectedRowId
    } else if (m.message.interactiveResponseMessage) {
        // تحليل بيانات أزرار التدفق الأصلية (Native Flow) بصيغة JSON واستخراج المعرّف
        id = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
    }
    
    // استخراج النص الظاهري الذي كتب على الزر وضغطه المستخدم
    let text = m.message.buttonsResponseMessage?.selectedDisplayText || m.message.templateButtonReplyMessage?.selectedDisplayText || m.message.listResponseMessage?.title
    let isIdMessage = false, usedPrefix
    
    // حلقة تكرارية للفحص والمطابقة داخل كل ملفات ومكونات البوت البرمجية المتوفرة (Plugins)
    for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin) continue
        if (plugin.disabled) continue // تجاهل الإضافات المعطلة
        
        // التحقق من قيود الإدارة والأوامر الحساسة
        if (!opts['restrict'])
            if (plugin.tags && plugin.tags.includes('admin'))
                continue
                
        if (typeof plugin !== 'function') continue
        if (!plugin.command) continue
        
        // دالة لتحويل النصوص العادية إلى تعبيرات نمطية آمنة (Escape Regex)
        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        
        // تحديد البادئة المستخدمة (Prefix) سواء كانت مخصصة للإضافة أو عامة للبوت (. أو # أو /)
        let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
        
        // فحص ومطابقة البادئة مع معرف الزر المضغوط لمعرفة أي أمر يجب تنفيذه
        let match = (_prefix instanceof RegExp ? 
            [[_prefix.exec(id), _prefix]] :
            Array.isArray(_prefix) ? 
                _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(id), re]
                }) :
                typeof _prefix === 'string' ? 
                    [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] :
                    [[[], new RegExp]]
        ).find(p => p[1])
        
        // إذا تطابقت البادئة، يتم استخراج اسم الأمر المجرّد وتحليله
        if ((usedPrefix = (match[0] || '')[0])) {
            let noPrefix = id.replace(usedPrefix, '')
            let [command] = noPrefix.trim().split` `.filter(v => v)
            command = (command || '').toLowerCase()
            
            // مطابقة اسم الأمر مع أوامر الملف (سواء كان نصاً، مصفوفة، أو تعبيراً نمطياً)
            let isId = plugin.command instanceof RegExp ? 
                plugin.command.test(command) :
                Array.isArray(plugin.command) ? 
                    plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? 
                        plugin.command === command :
                        false
                        
            if (isId) {
                isIdMessage = true
                break // التوقف عند العثور على التطابق الصحيح للامر
            }
        }
    }
    
    // توليد رسالة واتساب وهمية تحتوي على كود المعرف أو نص الزر لتمريرها لمحرك البوت
    let messages = await generateWAMessage(m.chat, { text: isIdMessage ? id : text, mentions: m.mentionedJid }, {
        userJid: this.user.id,
        quoted: m.quoted && m.quoted.fakeObj
    })
    
    // ضبط الخصائص الفوقية للرسالة المحقونة لتطابق هوية المستخدم وضمان الرد الصحيح
    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
    messages.key.id = m.key.id
    messages.pushName = m.name
    if (m.isGroup)
        messages.key.participant = messages.participant = m.sender
        
    // دمج الرسالة في كائن التحديث وضبط نوع العملية كإلحاق (append)
    let msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.fromObject(messages)].map(v => (v.conn = this, v)),
        type: 'append'
    }
    
    // إرسال الحدث المحقون داخلياً لتشغيل نظام الأوامر والرد على كبسة المستخدم فوراً
    this.ev.emit('messages.upsert', msg)
}
