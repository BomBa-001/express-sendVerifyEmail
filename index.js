import "dotenv/config";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import Mail from "./mail.js";
import otpStorage from "./otpStorage.js";
import { generateAccessToken, verifyToken } from "./jwt.js";

//#region { VARIABLES }  ====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====
const app = express();

const sever_port = process.env.Sever_PORT || 5000;
const sever_url = process.env.Sever_URL || "http://localhost";
const node_env = process.env.NODE_ENV || "development";
//#endregion /  ====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====

// إعداد __dirname في نمط ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

let db = [];

// Middleware لإعداد جلسة المستخدم
const setUserSession = (req, res, next) => {
  const { email, name } = req.user;
  res.cookie("isLoggedIn", "true");
  res.cookie("userEmail", email);
  res.cookie("userName", name);
  next();
};

// مسار التسجيل
app
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post((req, res) => {
    const { email, password, name } = req.body;
    db.push({ email, password, name, isVerified: false });
    let id = generateAccessToken({ name, email });
    let mail = new Mail();
    mail.setReceiver(email);
    mail.setSubject("Email Verification");
    mail.setHTML(
      `<html lang=en><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport><title>Email Verification</title><style>*{margin:0;padding:0;box-sizing:border-box}:root{--h:211;--primary:hsl(var(--h), 100%, 50%);--secondary:hsl(var(--h), 100%, 20%);--bg:hsl(var(--h), 100%, 95%);--cf:hsl(var(--h), 100%,   0%);--c-shadow:hsla(var(--h), 100%,   0%, 0.2)}body{font-family:Arial,sans-serif;background-color:var(--bg)}.email-container{max-width:37.5em;margin:1.875em auto;background-color:var(--bg);border-radius:.75em;overflow:hidden;box-shadow:0 .25em .75em var(--c-shadow)}.header{background:linear-gradient(90deg,var(--primary),var(--secondary));color:var(--bg);text-align:center;display:flex;align-items:center}.header img{max-width:5em;margin-bottom:.625em}.header h1{margin:0;font-size:1.75em;letter-spacing:.0625em}.body{padding:1.25em 1.875em;text-align:center}.body h2{font-size:1.5em;color:var(--cf);margin-bottom:1.25em}.body .code{font-size:1.75em;font-weight:700;color:var(--primary);letter-spacing:.125em;margin:1.25em 0;padding:.625em 1.25em;border-radius:.5em;display:inline-block;box-shadow:0 .25em .75em var(--c-shadow)}.body p{font-size:1em;color:var(--cf);line-height:1.6;margin:.625em 0}.footer{background-color:var(--bg);text-align:center;color:var(--cf);font-size:.875em;padding:.9375em;border-top:.0625em solid var(--cf)}.footer a{color:var(--primary);text-decoration:none}.button{margin-top:1.25em;display:inline-block;background:linear-gradient(90deg,var(--primary),var(--secondary));color:var(--bg);text-decoration:none;padding:.625em 1.25em;font-size:1em;font-weight:700;border-radius:.5em;transition:background-color .3s}.button:hover{background:linear-gradient(90deg,var(--secondary),var(--primary))}</style><div class=email-container><div class=header><img alt="BSM Logo"src="https://lh3.googleusercontent.com/a/ACg8ocIkkpz4RXGmwS0Pt7pBW4oi2zN9ilrf3PRALLJtRUC5Q8zjx0Q=s360-c-no"><h1>BSM</h1></div><div class=body><h2>Your Verification Code</h2><div class=code>999-999</div><p>BSM is an integrated management system designed to provide a comprehensive solution for system and operation management.</p><a href=${sever_url}:${sever_port}/verify/${id} class=button>Verify Now</a></div><div class=footer>All rights reserved to <strong>Bomba Company</strong> from 2025 until now.<br><a href=https://bomba-001.github.io/BomBa>Visit our website</a></div></div>`
    );
    mail
      .send()
      .then(() => {
        res.render("verifyEmailLoading");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  });

// مسار التحقق من البريد الإلكتروني
app.get(
  "/verify/:id",
  (req, res, next) => {
    const { id } = req.params;
    let isVerified = verifyToken(id);
    if (isVerified?.status) {
      db = db.map((user) => {
        if (user.email === isVerified?.payload?.email) {
          user.isVerified = true;
          req.user = { email: user.email, name: user.name };
        }
        return user;
      });
      next();
    } else {
      res.redirect("/login");
    }
  },
  setUserSession,
  (req, res) => {
    res.redirect("/");
  }
);

// توليد OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
};

// الصفحة الرئيسية
app.get("/", (req, res) => {
  const cookie = req.cookies["isLoggedIn"];
  const userName = req.cookies["userName"];
  if (!cookie) {
    return res.redirect("/login");
  }
  res.render("index", { user_name: userName });
});
// عرض البيانات المسجلة
app.get("/db", (req, res) => {
  // إذا كانت المصفوفة فارغة، يمكن إرجاع رسالة مخصصة
  if (db.length === 0) {
    return res.status(404).json({ message: "No data found" });
  }
  // إرجاع القيم المخزنة في db
  return res.json(db);
});

// تسجيل الدخول
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const { email, password } = req.body;
    const user = db.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      console.log("User found:", user);
      res.cookie("isLoggedIn", "true");
      return res.redirect("/");
    } else {
      console.log("Invalid credentials");
      return res.status(401).send("Invalid credentials");
    }
  });

// تسجيل الخروج
app.get("/logout", (req, res) => {
  res.clearCookie("isLoggedIn");
  res.redirect("/login");
});

// استعادة كلمة المرور
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.get("/verify-otp", (req, res) => {
  const email = req.query.email;
  const error = req.query.error;
  res.render("verify-otp", { email, error });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (email && db.find((user) => user.email === email)) {
    let otp = await generateOTP();
    otpStorage.set(email, otp);
    let forgetPassTemplate = fs.readFileSync(
      path.join(__dirname, "forgotPassword.html"),
      "utf-8"
    );
    forgetPassTemplate = forgetPassTemplate.replace("{{user_name}}", email);
    forgetPassTemplate = forgetPassTemplate.replace("{{OTP_CODE}}", otp);
    let mail = new Mail();
    mail.setReceiver(email);
    mail.setSubject("Password Reset");
    mail.setHTML(forgetPassTemplate);
    mail
      .send()
      .then(() => {
        res.render("verify-otp", { email });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.status(400).json({ message: "Invalid Email" });
  }
});

// التحقق من OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);

  if (otpStorage.verify(email, otp)) {
    console.log("verified");
    res.cookie("isLoggedIn", "true");
    res.redirect("/");
  } else {
    const error = "Invalid OTP";
    res.redirect(
      `/verify-otp?email=${email}&error=${encodeURIComponent(error)}`
    );
  }
});

//#region { SERVER LISTEN }  ====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====
// const server =
app.listen(sever_port, () => {
  // eslint-disable-next-line no-undef
  console.log(`🖥️  The Server is running: ${sever_url}:${sever_port}`);
  // eslint-disable-next-line no-undef
  console.log(`🏗️  Server is running in ${node_env} mode...`);
});
// error handle Rejection ** أخطاء خارج السيرفر مثل (إنقطاع الإتصال بقاعدة البيانات)
process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-undef
  console.error(
    `Unhandled Rejection Error: ${err.name} | ${err.message}${
      node_env === "development" && "\n    " + err.stack
    }`
  );
  // server.close(()=>{process.exit(1);}); // نها تشغيل السيرفر...
});
//#endregion /  ====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====	====
