import { promises } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'

/**
 * دالة المعالجة الأساسية لأداة FFmpeg لـ تحويل الملفات والوسائط
 * @param {Buffer} buffer بافر الملف المراد تحويله
 * @param {Array} args معاملات وأوامر الفلاتر والضغط
 * @param {String} ext امتداد الملف المدخل الافتراضي
 * @param {String} ext2 امتداد الملف الخارجي الناتج
 */
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      // إنشاء مسار فريد للملف المؤقت في مجلد tmp بناءً على الطابع الزمني الحالي
      let tmp = join(global.__dirname(import.meta.url), '../tmp', + new Date + '.' + ext)
      let out = tmp + '.' + ext2
      
      // كتابة البافر الأصلي كملف مؤقت لبدء معالجته
      await promises.writeFile(tmp, buffer)
      
      // تشغيل أمر FFmpeg عبر العمليات الابنة بالسيرفر (spawn)
      spawn('ffmpeg', [
        '-y', // الموافقة التلقائية على استبدال الملفات إن وجدت بنفس الاسم
        '-i', tmp, // الملف المدخل
        ...args,   // المعاملات الخاصة بكل صيغة
        out        // الملف الناتج النهائي
      ])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            // حذف الملف المؤقت المدخل فور انتهاء العملية لتوفير مساحة السيرفر
            await promises.unlink(tmp)
            if (code !== 0) return reject(code)
            
            // إرسال البيانات النهائية مع دالة مدمجة لحذف الملف الخارجي بعد إرساله للواتساب
            resolve({
              data: await promises.readFile(out),
              filename: out,
              delete() {
                return promises.unlink(out)
              }
            })
          } catch (e) {
            reject(e)
          }
        })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * تحويل الصوت إلى رسالة صوتية مباشرة قابلة للتشغيل تلقائياً (ريكورد / PTT)
 * @param {Buffer} buffer بافر الصوت الأصلي
 * @param {String} ext امتداد الملف الحالي
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',           // إلغاء أي مسار فيديو أو صورة مدمجة بالصوت
    '-c:a', 'libopus', // ترميز الصوت المعتمد رسمياً في ريكوردات الواتساب
    '-b:a', '128k',   // معدل البت لتأمين جودة ممتازة
    '-vbr', 'on',     // تفعيل ميزة معدل البت المتغير لتقليص الحجم الذكي
  ], ext, 'ogg')
}

/**
 * تحويل الصوت إلى ملف صوتي عادي (Audio) متوافق مع مشغلات الواتساب
 * @param {Buffer} buffer بافر الصوت الأصلي
 * @param {String} ext امتداد الملف الحالي
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10' // تفعيل أقصى مستويات الضغط لتقليل حجم الملف دون تدمير جودة الصوت
  ], ext, 'opus')
}

/**
 * معالجة وضغط الفيديو ليصبح متوافقاً وقابلاً للعرض المباشر على الواتساب
 * @param {Buffer} buffer بافر الفيديو الأصلي
 * @param {String} ext امتداد ملف الفيديو الحالي
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264', // ترميز الفيديو الأكثر استقراراً ودعماً للواتساب والهواتف (H.264)
    '-c:a', 'aac',     // ترميز الصوت التابع للفيديو
    '-ab', '128k',     // معدل البت الصوتي
    '-ar', '44100',    // تردد العينة القياسي للصوت
    '-crf', '32',      // معدل جودة الفيديو وثباته (كلما زاد الرقم قل الحجم بشكل رائع ومناسب للبوت)
    '-preset', 'slow'  // تفعيل المعالجة العميقة لضمان أفضل ضغط ممكن للملف الناتج
  ], ext, 'mp4')
}

export {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
}
