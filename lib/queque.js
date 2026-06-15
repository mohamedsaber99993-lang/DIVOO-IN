import EventEmitter from "events"

// دالة فحص للتأكد من أن القيمة الممررة هي رقم صحيح وليست خطأ برمجياً (NaN)
const isNumber = x => typeof x === 'number' && !isNaN(x)

// دالة تأخير زمني مخصصة تعتمد على الوعود (Promises) لتأجيل التنفيذ
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// الوقت الافتراضي للتأخير بين عمليات الطابور (5 ثوانٍ) لحماية الحساب من الحظر (Anti-Ban)
const QUEQUE_DELAY = 5 * 1000

/**
 * كلاس إدارة طابور الانتظار المطور لتنظيم إرسال الرسائل ومعالجة البيانات بالتوالي
 * يرث الكلاس خصائص مُصدر الأحداث (EventEmitter) للتحكم في توقيت إطلاق العمليات
 */
export default class Queque extends EventEmitter {
    // استخدام كائن Set لمنع تكرار نفس المعامل أو الرسالة داخل الطابور الواحد
    _queque = new Set()

    constructor() {
        super()
    }

    /**
     * إضافة عنصر أو رسالة جديدة إلى نهاية طابور الانتظار
     * @param {any} item العنصر المراد جدوته
     */
    add(item) {
        this._queque.add(item)
    }

    /**
     * التحقق مما إذا كان العنصر موجوداً بالفعل داخل الطابور
     */
    has(item) {
        return this._queque.has(item)
    }

    /**
     * حذف عنصر معين من طابور الانتظار
     */
    delete(item) {
        this._queque.delete(item)
    }

    /**
     * جلب العنصر الأول في الطابور (صاحب الدور الحالي)
     */
    first() {
        return [...this._queque].shift()
    }

    /**
     * التحقق مما إذا كان هذا العنصر هو صاحب الدور الأول الحالي
     */
    isFirst(item) {
        return this.first() === item
    }

    /**
     * جلب العنصر الأخير الذي تمت إضافته للطابور
     */
    last() {
        return [...this._queque].pop()
    }

    /**
     * التحقق مما إذا كان العنصر يقف في آخر الطابور
     */
    isLast(item) {
        return this.last() === item
    }

    /**
     * معرفة ترتيب ومؤشر العنصر الحالي داخل الطابور (تبدأ من 0)
     */
    getIndex(item) {
        return [...this._queque].indexOf(item)
    }

    /**
     * جلب الحجم الإجمالي الحالي للعناصر المنتظرة في الطابور
     */
    getSize() {
        return this._queque.size
    }

    /**
     * التحقق مما إذا كان طابور الانتظار فارغاً تماماً
     */
    isEmpty() {
        return this.getSize() === 0
    }

    /**
     * إخراج العنصر من الطابور وتمريره للتنفيذ الفوري وإطلاق الحدث الخاص به
     * @param {any} item العنصر المراد إخراجه (اختياري)
     */
    unqueue(item) {
        let queque;
        if (item) {
            if (this.has(item)) {
                queque = item
                const isFirst = this.isFirst(item)
                if (!isFirst) {
                    throw new Error('العنصر ليس الأول في طابور الانتظار، لا يمكن خروجه قبل حلول دوره!')
                }
            }
        } else {
            queque = this.first()
        }

        if (queque) {
            this.delete(queque)
            this.emit(queque) // إطلاق حدث مخصص باسم العنصر ليعلم مستمع الانتظار أن دوره قد حان
        }
    }

    /**
     * جعل عملية معينة تنتظر في الطابور حتى يحين دورها تلقائياً وتطبيق التأخير الأمني
     * @param {any} item العنصر أو الرسالة التي يجب أن تنتظر دورها
     */
    waitQueue(item) {
        return new Promise((resolve, reject) => {
            if (this.has(item)) {
                // الدالة الداخلية لإنهاء الانتظار وتمرير الدور للعنصر التالي
                const solve = async (removeQueque = false) => {
                    await delay(QUEQUE_DELAY) // تطبيق التأخير الزمني لحماية البوت من الحظر الإجباري
                    if (removeQueque) this.unqueue(item)
                    if (!this.isEmpty()) this.unqueue() // إذا كان هناك عناصر أخرى مستحقة، يتم استدعاء دورها
                    resolve()
                }

                // إذا كان العنصر هو الأول، يبدأ تنفيذه فوراً مع تفعيل دالة الحذف والتمرير لتجنب التعليق
                if (this.isFirst(item)) {
                    solve(true)
                } else {
                    // إذا كان في الخلف، يتم وضعه في حالة استماع لحدث ينطلق باسمه فور خروج من يسبقه
                    this.once(item, solve)
                }
            } else {
                reject(new Error('هذا العنصر غير موجود في طابور الانتظار الحالية!'))
            }
        })
    }
}
