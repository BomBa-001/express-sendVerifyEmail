/**
 * @class TempStorage
 * @description كلاس لإدارة التخزين المؤقت (مثل تخزين OTP) باستخدام كائن Map.
 */
export default class TempStorage {
  /**
   * @constructor
   * @description تهيئة كائن التخزين المؤقت باستخدام Map.
   */
  constructor() {
    /**
     * التخزين المؤقت للبيانات (مفتاح: البريد الإلكتروني، القيمة: OTP).
     * @type {Map<string, number>}
     */
    this.storage = new Map();
  }

  /**
   * تخزين رمز OTP المرتبط بالبريد الإلكتروني مع حذف تلقائي بعد فترة زمنية محددة.
   * @param {string} email - البريد الإلكتروني للمستخدم.
   * @param {number} otp - رمز OTP المطلوب تخزينه.
   * @param {number} [duration=300000] - المدة (بالمللي ثانية) قبل حذف OTP (افتراضيًا: 5 دقائق).
   */
  set(email, otp, duration = 1000 * 60 * 5) {
    this.storage.set(email, otp); // تخزين OTP مع البريد الإلكتروني كمفتاح.
    setTimeout(() => this.storage.delete(email), duration); // حذف OTP بعد انتهاء المدة.
  }

  /**
   * التحقق من رمز OTP المخزن للبريد الإلكتروني.
   * @param {string} email - البريد الإلكتروني للمستخدم.
   * @param {number} otp - رمز OTP للتحقق منه.
   * @returns {boolean} - إرجاع `true` إذا كان رمز OTP صحيحًا، خلاف ذلك `false`.
   */
  verify(email, otp) {
    return this.storage.get(email) === Number(otp);
  }

  /**
   * حذف إدخال معين يدويًا من التخزين.
   * @param {string} email - البريد الإلكتروني للمستخدم المطلوب حذف إدخاله.
   */
  delete(email) {
    this.storage.delete(email);
  }

  /**
   * الحصول على جميع الإدخالات المخزنة (مفيد لأغراض التصحيح أو الاختبار).
   * @returns {Map<string, number>} - كائن Map يحتوي على جميع الإدخالات المخزنة.
   */
  getAll() {
    return this.storage;
  }
}
