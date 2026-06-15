import mongoose from 'mongoose'

const { Schema, connect, model: _model } = mongoose
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true }

/**
 * الكلاس الأساسي لإدارة قاعدة بيانات MongoDB (الإصدار الأول)
 * يقوم هذا النظام بحفظ كامل بيانات البوت داخل وثيقة واحدة (Single Document) كبيرة.
 */
export class mongoDB {
  constructor(url, options = defaultOptions) {
    /**
     * @type {string}
     */
    this.url = url
    /**
     * @type {mongoose.ConnectOptions}
     */
    this.options = options
    this.data = this._data = {}
    /**
     * @type {mongoose.Schema}
     */
    this._schema = {}
    /**
     * @type {mongoose.Model}
     */
    this._model = {}
    /**
     * @type {Promise<typeof mongoose>}
     */
    this.db = connect(this.url, { ...this.options }).catch(console.error)
  }

  // قراءة البيانات من السيرفر السحابي
  async read() {
    this.conn = await this.db
    let schema = this._schema = new Schema({
      data: {
        type: Object,
        required: true, 
        default: {}
      }
    })
    try { this._model = _model('data', schema) } catch { this._model = _model('data') }
    this._data = await this._model.findOne({})
    
    // إذا كانت قاعدة البيانات فارغة تمامًا، يتم تهيئة وثيقة جديدة فارغة وحفظها
    if (!this._data) {
      this.data = {}
      const [_, _data] = await Promise.all([
        this.write(this.data),
        this._model.findOne({})
      ])
      this._data = _data
    } else this.data = this._data.data
    return this.data
  }

  // كتابة وتحديث البيانات في السيرفر السحابي
  write(data) {
    return new Promise(async (resolve, reject) => {
      if (!data) return reject(data)
      if (!this._data) return resolve((new this._model({ data })).save())
      
      // البحث عن الوثيقة بواسطة المعرف الخاص بها وتحديث محتواها بالكامل
      this._model.findById(this._data._id, (err, docs) => {
        if (err) return reject(err)
        if (!docs.data) docs.data = {}
        docs.data = data
        this.data = {}
        return docs.save(resolve)
      })
    })
  }
}

/**
 * الكلاس المطور لإدارة قاعدة البيانات (الإصدار الثاني المطور - MongoDB V2)
 * ميزته الأساسية أنه يقوم بتقسيم وتوزيع الجداول إلى مجموعات منفصلة (Multi-Collections)
 * مما يمنع حدوث بطء في البوت عند تضخم حجم البيانات ويقضي على قيود حجم الوثيقة المفردة.
 */
export const mongoDBV2 = class MongoDBV2 {
  constructor(url, options = defaultOptions) {
    /**
     * @type {string}
     */
    this.url = url
    /**
     * @type {mongoose.ConnectOptions}
     */
    this.options = options
    /**
     * @type {{ name: string, model: mongoose.Model}[]}
     */
    this.models = []
    /**
     * @type {{ [Key: string]: any }}
     */
    this.data = {}
    this.lists
    /**
     * @type {mongoose.Model}
     */
    this.list
    /**
     * @type {Promise<typeof mongoose>}
     */
    this.db = connect(this.url, { ...this.options }).catch(console.error)
  }

  // جلب وقراءة كامل الجداول المهيكلة داخل قاعدة البيانات الموزعة
  async read() {
    this.conn = await this.db
    let schema = new Schema({
      data: [{
        name: String,
      }]
    })
    try { this.list = _model('lists', schema) } catch (e) { this.list = _model('lists') }
    this.lists = await this.list.findOne({})
    if (!this.lists?.data) {
      await this.list.create({ data: [] })
      this.lists = await this.list.findOne({})
    }
    let garbage = []
    
    // استخراج وفهرسة البيانات من القوائم المختلفة لكل جدول (مستخدمين، مجموعات، إحصائيات)
    for (let { name } of this.lists.data) { 
      /**
       * @type {mongoose.Model}
       */
      let collection
      try { collection = _model(name, new Schema({ data: Array })) } catch (e) {
        console.error(e)
        try { collection = _model(name) } catch (e) {
          garbage.push(name)
          console.error(e)
        }
      }
      if (collection) {
        this.models.push({ name, model: collection })
        let collectionsData = await collection.find({})
        this.data[name] = Object.fromEntries(collectionsData.map(v => v.data))
      }
    }
    try {
      // تنظيف وحذف القوائم التالفة أو غير الموجودة في الذاكرة لتوفير المساحة
      let del = await this.list.findById(this.lists._id)
      del.data = del.data.filter(v => !garbage.includes(v.name))
      await del.save()
    } catch (e) {
      console.error(e)
    }

    return this.data
  }

  // توزيع وحفظ تحديثات البيانات بكفاءة عبر فصل كل جدول وتحديث وثائقه بشكل مستقل
  write(data) {
    return new Promise(async (resolve, reject) => {
      if (!this.lists || !data) return reject(data || this.lists)
      let collections = Object.keys(data), listDoc = [], index = 0
      for (let key of collections) {
        
        // إذا كان الجدول موجودًا مسبقًا، يتم تحديث محتواه الفعلي وحذف القديم
        if ((index = this.models.findIndex(v => v.name === key)) !== -1) {
          let doc = this.models[index].model
          await doc.deleteMany().catch(console.error) 
          await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })))
          if (doc && key) listDoc.push({ name: key })
        } else { // إذا كان جدولًا جديدًا تمامًا، يتم إنشاء مخطط فريد وحفظه تلقائيًا في السحاب
          let schema = new Schema({
            data: Array
          })
          /**
           * @type {mongoose.Model}
           */
          let doc
          try {
            doc = _model(key, schema)
          } catch (e) {
            console.error(e)
            doc = _model(key)
          }
          index = this.models.findIndex(v => v.name === key)
          this.models[index === -1 ? this.models.length : index] = { name: key, model: doc }
          await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })))
          if (doc && key) listDoc.push({ name: key })
        }
      }

      // حفظ قائمة الفهارس الرئيسية وتأكيد إتمام العملية
      this.list.findById(this.lists._id, function (err, doc) {
        if (err) return reject(err)
        doc.data = listDoc
        this.data = {}
        return doc.save(resolve)
      })
      return resolve(true)
    })
  }
}
