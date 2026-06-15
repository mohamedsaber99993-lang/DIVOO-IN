import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * دالة رفع الملفات والميديا إلى سيرفر Catbox السحابي
 * أنواع الميديا والصيغ المدعومة:
 * - صور: `image/jpeg` و `image/jpg` و `image/png`
 * - فيديو: `video/mp4` و `video/webm`
 * - صوتيات: `audio/mpeg` و `audio/wav`
 * @param {Buffer} buffer بافر الملف المراد رفعه
 * @return {Promise<string>} يعيد رابط الويب المباشر للملف
 */
export default async (buffer) => {
  // التعرف التلقائي على امتداد الملف ونوع الميديا من البافر
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  
  // تجهيز البيانات وإلحاقها بالنموذج طبقاً لمتطلبات Catbox API
  form.append('fileToUpload', blob, 'tmp.' + ext);
  form.append('reqtype', 'fileupload');
  
  // إرسال طلب الرفع عبر بروتوكول POST إلى رابط واجهة برمجة التطبيقات
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  });
  
  // استقبال النتيجة النصية الراجعة من السيرفر
  const result = await res.text(); 
  
  // التحقق من نجاح عملية الرفع (إذا كانت النتيجة تبدأ برابط Catbox الرسمي)
  if (result.startsWith('https://files.catbox.moe/')) {
    return result; // إرجاع الرابط المباشر بنجاح
  } else {
    // إطلاق استثناء في حال فشل السيرفر في معالجة أو استقبال الملف
    throw new Error('فشل في رفع الملف إلى خادم Catbox السحابي');
  }
};
