import { readdirSync, existsSync, readFileSync, watch } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'
import chokidar from 'chokidar' // مكتبة متطورة لمراقبة التغيرات في الملفات بشكل فوري ومستقر

const __dirname = Helper.__dirname(import.meta)
const pluginFolder = Helper.__dirname(join(__dirname, '../plugins/index'))
// فلتر يدعم ملفات الجافاسكربت العادية (.js) وملحقات الأكواد المضغوطة (.mcjs)
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

let watcher, plugins, pluginFolders = []
watcher = plugins = {}

/**
 * دالة تهيئة وقراءة ملفات الأوامر (Plugins) وفهرستها في الذاكرة لأول مرة
 * @param {String} pluginFolder مسار مجلد الأوامر الرئيسي
 * @param {Function} pluginFilter الفلتر المستخدم للتحقق من امتدادات الملفات
 * @param {Object} conn كائن اتصال الواتساب الخاص بالبوت لطباعة السجلات (Logs)
 */
async function filesInit(pluginFolder = pluginFolder, pluginFilter = pluginFilter, conn) {
    const folder = resolve(pluginFolder)
    if (folder in watcher) return
    pluginFolders.push(folder)

    // قراءة وتحميل كافة الملحقات المتوافقة مع الفلتر تزامناً وبشكل متوازي
    await Promise.all(readdirSync(folder).filter(pluginFilter).map(async filename => {
        try {
            let file = global.__filename(join(folder, filename))
            const module = await import(file)
            if (module) plugins[filename] = 'default' in module ? module.default : module
        } catch (e) {
            conn?.logger.error(e)
            delete plugins[filename] // إزالة الملف من القائمة في حال حدوث خطأ داخلي فيه
        }
    }))

    // إعداد مراقب الملفات Chokidar لتتبع أي إضافات، تعديلات، أو حذوفات فورية
    const watching = chokidar.watch(folder, {
        ignoreInitial: true // تجاهل الفحص المبدئي للأوامر التي تم تحميلها بالفعل لتوفير موارد السيرفر
    })

    // ربط الأحداث المختلفة للتعامل الذكي مع الملفات حية (Hot-Reload)
    watching.on('add', file => reload(conn, folder, pluginFilter, 'add', file.split('/').pop()))
    watching.on('change', file => reload(conn, folder, pluginFilter, 'change', file.split('/').pop()))
    watching.on('unlink', file => reload(conn, folder, pluginFilter, 'unlink', file.split('/').pop()))

    watcher[folder] = watching

    return plugins
}

/**
 * إيقاف مراقبة مجلد معين وحذفه من قائمة المراقبة الحية
 * @param {String} folder المسار المراد إزالته
 * @param {Boolean} isAlreadyClosed حالة الإغلاق المسبق للمراقب
 */
function deletePluginFolder(folder, isAlreadyClosed = false) {
    const resolved = resolve(folder)
    if (!(resolved in watcher)) return
    if (!isAlreadyClosed) watcher[resolved].close()
    delete watcher[resolved]
    pluginFolders.splice(pluginFolders.indexOf(resolved), 1)
}

/**
 * الدالة الأساسية المسؤولة عن إعادة التحميل الديناميكي للأمر (Hot-Reload) عند حدوث أي تعديل
 */
async function reload(conn, pluginFolder = pluginFolder, pluginFilter = pluginFilter, _ev, filename) {
    if (pluginFilter(filename)) {
        let dir = global.__filename(join(pluginFolder, filename), true)
        
        // التحقق مما إذا كان الملف موجوداً مسبقاً في قائمة الملحقات المفعّلة
        if (filename in plugins) {
            if (existsSync(dir)) conn.logger.info(`🔄 تم تحديث وإعادة تحميل الملحق بنجاح - '${filename}'`)
            else {
                conn?.logger.warn(`🗑️ تم حذف ملف الملحق الحالي من السيرفر - '${filename}'`)
                return delete plugins[filename]
            }
        } else conn?.logger.info(`✨ اكتشاف ملحق أو أمر جديد تماماً وجاري تشغيله - '${filename}'`)
        
        // فحص سينتكس وبناء الكود البرمجي للملف المعدل قبل استيراده منعاً لإيقاف تشغيل البوت
        let err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true
        })
        
        if (err) conn.logger.error(`❌ خطأ بناء وسينتكس في ملف '${filename}'\n${format(err)}`)
        else try {
            // استيراد الملف ديناميكياً مع كسر التخزين المؤقت (Cache Busting) عبر دالة importFile المخصصة
            const module = await importFile(global.__filename(dir)).catch(console.error)
            if (module) plugins[filename] = module
        } catch (e) {
            conn?.logger.error(`❌ فشل في تحميل واستيراد الأمر المتأثر '${filename}\n${format(e)}'`)
        } finally {
            // إعادة ترتيب المصفوفة أبجدياً بعد كل عملية إضافة أو تعديل لتسهيل البحث وعرض القوائم
            plugins = Object.fromEntries(Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b)))
        }
    }
}

export {
    pluginFolder,
    pluginFilter,
    plugins,
    watcher,
    pluginFolders,
    filesInit,
    deletePluginFolder,
    reload
}
