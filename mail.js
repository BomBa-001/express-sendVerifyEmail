// استيراد مكتبة nodemailer لإنشاء وإرسال رسائل البريد الإلكتروني.
import nodemailer from 'nodemailer';

/**
 * إعدادات النقل لبريد Gmail باستخدام nodemailer.
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail', // استخدام خدمة Gmail.
    host: 'smtp.gmail.com', // مضيف SMTP الخاص بـ Gmail.
    secure: false, // عدم استخدام التشفير الافتراضي (SSL/TLS).
    port: 587, // منفذ SMTP غير المشفر.
    auth: {
        user: process.env.EMAIL, // البريد الإلكتروني المستخدم لإرسال الرسائل (يتم تخزينه في متغير بيئة).
        pass: process.env.PASSWORD // كلمة المرور الخاصة بالبريد الإلكتروني (يتم تخزينها في متغير بيئة).
    }
});

/**
 * @class Mail
 * @description كائن لإعداد وإرسال رسائل البريد الإلكتروني باستخدام nodemailer.
 */
export default class Mail {
    /**
     * @constructor
     * @description إنشاء كائن جديد يحتوي على إعدادات البريد الافتراضية.
     */
    constructor() {
        /**
         * خيارات البريد الإلكتروني الافتراضية.
         * @type {Object}
         */
        this.mailOptions = {
            from: {
                address: process.env.EMAIL, // البريد الإلكتروني المرسل.
                name: process.env.AppName||"Ultimate Coding Beast" // الاسم الافتراضي للمرسل.
            },
            to: [], // قائمة المستلمين.
            cc: [], // الأشخاص المنسوخ لهم (نسخة).
            bcc: [], // الأشخاص المنسوخ لهم (نسخة مخفية).
            attachments: [] // المرفقات المرسلة مع البريد.
        };
    }

    /**
     * @description تغيير اسم الشركة أو المرسل.
     * @param {string} name - اسم الشركة الجديد.
     */
    setCompanyName(name) {
        this.mailOptions.from.name = name;
    }

    /**
     * @description تغيير البريد الإلكتروني للمرسل.
     * @param {string} email - البريد الإلكتروني الجديد للمرسل.
     */
    setSenderEmail(email) {
        this.mailOptions.from.address = email;
    }

    /**
     * @description تحديد المستلمين للبريد الإلكتروني.
     * @param {string|string[]} receiver - بريد المستلم أو قائمة بالمستلمين.
     */
    setReceiver(receiver) {
        if (Array.isArray(receiver)) {
            this.mailOptions.to.push(...receiver);
        } else {
            this.mailOptions.to.push(receiver);
        }
    }

    /**
     * @description إضافة الأشخاص المنسوخ لهم (نسخة).
     * @param {string|string[]} cc - بريد الشخص أو قائمة الأشخاص المنسوخ لهم.
     */
    setCC(cc) {
        if (Array.isArray(cc)) {
            this.mailOptions.cc.push(...cc);
        } else {
            this.mailOptions.cc.push(cc);
        }
    }

    /**
     * @description إضافة الأشخاص المنسوخ لهم (نسخة مخفية).
     * @param {string|string[]} bcc - بريد الشخص أو قائمة الأشخاص المنسوخ لهم (نسخة مخفية).
     */
    setBCC(bcc) {
        if (Array.isArray(bcc)) {
            this.mailOptions.bcc.push(...bcc);
        } else {
            this.mailOptions.bcc.push(bcc);
        }
    }

    /**
     * @description تحديد عنوان البريد الإلكتروني (الموضوع).
     * @param {string} subject - عنوان البريد الإلكتروني.
     */
    setSubject(subject) {
        this.mailOptions.subject = subject;
    }

    /**
     * @description تحديد النص العادي لمحتوى البريد.
     * @param {string} text - النص العادي للبريد.
     */
    setText(text) {
        this.mailOptions.text = text;
    }

    /**
     * @description تحديد محتوى البريد بصيغة HTML.
     * @param {string} html - النص بصيغة HTML.
     */
    setHTML(html) {
        this.mailOptions.html = html;
    }

    /**
     * @description إضافة مرفقات للبريد الإلكتروني.
     * @param {Object|Object[]} attachment - مرفق أو قائمة بالمرفقات.
     */
    setAttachment(attachment) {
        if (Array.isArray(attachment)) {
            this.mailOptions.attachments.push(...attachment);
        } else {
            this.mailOptions.attachments.push(attachment);
        }
    }

    /**
     * @description إرسال البريد الإلكتروني باستخدام nodemailer.
     * @returns {Promise<Object>} يعيد كائنًا يحتوي على معلومات حول الإرسال.
     */
    async send() {
        try {
            const info = await transporter.sendMail(this.mailOptions);
            return info; // في حالة نجاح الإرسال، يتم إرجاع معلومات الإرسال.
        } catch (error) {
            throw error; // في حالة وجود خطأ، يتم رمي الاستثناء.
        }
    }
}
