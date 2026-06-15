import { resolve, dirname as _dirname } from 'path'
import _fs, { existsSync, readFileSync } from 'fs'
const { promises: fs } = _fs

class Database {
    /**
     * إنشاء مثيل جديد لإدارة قاعدة البيانات الجيسون (JSON Database)
     * @param {String} filepath المسار المحدد لملف قاعدة البيانات
     * @param  {...any} args المعاملات الإضافية التابعة لـ JSON.stringify لتنسيق الملف
     */
    constructor(filepath, ...args) { 
        this.file = resolve(filepath)
        this.logger = console
        
        // تحميل البيانات فوراً عند استدعاء الكلاس لأول مرة
        this._load()

        this._jsonargs = args
        this._state = false // حالة المعالجة الحالية (مزيج بين قراءة وكتابة)
        this._queue = []    // طابور العمليات المجدولة لمنع تداخل عمليات الكتابة (Race Conditions)
        
        // فحص مجدول كل 1 ثانية لتنفيذ العمليات الموجودة في الطابور بالتوالي
        this._interval = setInterval(async () => {
          if (!this._state && this._queue && this._queue[0]) {
            this._state = true
            // سحب العملية الأولى من الطابور وتنفيذها تلقائياً مع التقاط الأخطاء
            await this[this._queue.shift()]().catch(this.logger.error)
            this._state = false
          }
        }, 1000)
    }

    // جلب البيانات الحالية المخزنة في الذاكرة المؤقتة
    get data() {
        return this._data
    }

    // تحديث البيانات وحفظها تلقائياً في الملف الفيزيائي
    set data(value) {
        this._data = value
        this.save()
    }

    /**
     * إضافة عملية "تحديث وتحميل البيانات" إلى الطابور
     */
    load() {
        this._queue.push('_load')
    }

    /**
     * إضافة عملية "حفظ البيانات في القرص" إلى الطابور
     */
    save() {
        this._queue.push('_save')
    }

    // الدالة الداخلية المسؤولة عن قراءة الملف وتحويله إلى كائن برمي
    _load() {
        try {
          return this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {}
        } catch (e) {
          this.logger.error(e)
          return this._data = {} // تهيئة كائن فارغ في حال حدوث خطأ أو تلف في هيكلة الملف
        }
    }

    // الدالة الداخلية غير المتزامنة المسؤولة عن كتابة وحفظ البيانات في القرص الصلب
    async _save() {
        let dirname = _dirname(this.file)
        // إنشاء المجلدات الأبوية للمسار بشكل تكراري إذا لم تكن موجودة
        if (!existsSync(dirname)) await fs.mkdir(dirname, { recursive: true })
        // كتابة البيانات بعد تحويلها إلى نص جيسون منسق
        await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs))
        return this.file
    }
}

export default Database
