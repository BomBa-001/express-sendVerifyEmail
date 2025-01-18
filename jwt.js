import jwt from 'jsonwebtoken'; // استيراد مكتبة JSON Web Token.
import crypto from 'crypto'; // استيراد مكتبة crypto لتوليد سلاسل عشوائية.

// المفتاح السري المستخدم لتوقيع التوكنات.
const secret = 'Hello I am a secret';

/**
 * توليد سلسلة عشوائية بطول محدد.
 * @param {number} length - طول السلسلة المطلوب توليدها.
 * @returns {string} سلسلة عشوائية تحتوي على أحرف وأرقام.
 */
function rmdStr(length) {
    return crypto.randomBytes(length)
        .toString('base64') // تحويل البايتات إلى سلسلة Base64.
        .slice(0, length) // اقتطاع السلسلة للطول المطلوب.
        .replace(/[^a-zA-Z0-9]/g, ''); // إزالة أي رموز غير الأحرف والأرقام.
}

/**
 * @class ShortURL
 * يمثل تخزينًا مؤقتًا للروابط القصيرة مع التوكنات.
 */
class ShortURL {
    constructor() {
        /**
         * تخزين الروابط القصيرة باستخدام Map.
         * @type {Map<string, string>}
         */
        this.storage = new Map();
    }

    /**
     * تخزين توكن مرتبط بسلسلة قصيرة.
     * @param {string} shortStr - السلسلة القصيرة (الرابط القصير).
     * @param {string} token - التوكن المرتبط بالسلسلة.
     */
    set(shortStr, token) {
        this.storage.set(shortStr, token);
    }

    /**
     * استرجاع التوكن المرتبط بسلسلة قصيرة.
     * @param {string} shortStr - السلسلة القصيرة (الرابط القصير).
     * @returns {string|undefined} التوكن إذا وجد أو undefined إذا لم يوجد.
     */
    get(shortStr) {
        return this.storage.get(shortStr);
    }
}

// إنشاء كائن جديد من ShortURL.
const shortURL = new ShortURL();

/**
 * توليد توكن JWT جديد وتخزينه باستخدام رابط قصير.
 * @param {Object} payload - البيانات المراد تضمينها في التوكن.
 * @returns {string} السلسلة القصيرة (الرابط القصير) المرتبط بالتوكن.
 * @throws {Error} إذا لم يتم توفير البيانات (payload).
 */
export const generateAccessToken = (payload) => {
    if (!payload) {
        throw new Error('Payload is required for generating access token');
    }

    // إنشاء توكن JWT مع توقيع باستخدام المفتاح السري.
    const token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '10s' });
    const id = rmdStr(12); // توليد سلسلة عشوائية بطول 12 حرفًا.
    shortURL.set(id, token); // تخزين التوكن باستخدام الرابط القصير.
    return id; // إرجاع الرابط القصير.
};

/**
 * التحقق من صحة التوكن باستخدام الرابط القصير.
 * @param {string} id - الرابط القصير المرتبط بالتوكن.
 * @returns {Object} نتيجة التحقق تحتوي على الحالة (status) والرسالة (message) والبيانات (payload) إذا نجحت.
 */
export const verifyToken = (id) => {
    try {
        // استرجاع التوكن من الرابط القصير.
        const token = shortURL.get(id);

        // التحقق من صحة التوكن باستخدام المفتاح السري.
        const decoded = jwt.verify(token, secret);

        return {
            status: true, // الحالة ناجحة.
            payload: decoded, // البيانات المضمنة في التوكن.
            message: 'Email verified successfully' // رسالة النجاح.
        };
    } catch (error) {
        return {
            status: false, // الحالة فاشلة.
            message: error.message, // رسالة الخطأ.
        };
    }
};
