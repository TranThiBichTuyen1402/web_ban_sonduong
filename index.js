require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');

// 1. Cấu hình cơ bản
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public')));

// 2. Cấu hình Session (BẮT BUỘC để trước Router)
app.use(session({
    secret: 'bichtuyen_beauty',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// 3. Kích hoạt Passport
app.use(passport.initialize());
app.use(passport.session());

// Model Khách hàng
const khachhang = require('./models/khachhang'); 

// 4. Cấu hình Passport Google
passport.use(new (require('passport-google-oauth20').Strategy)({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const emailGoogle = profile.emails[0].value;
        const tenGoogle = profile.displayName;

        let khach = await khachhang.findOne({ email: emailGoogle });
        if (!khach) {
            // Sửa lỗi tên biến ở đây: khachhang (viết thường) khớp với require phía trên
            khach = await khachhang.create({
                tenKhachHang: tenGoogle,
                dienThoai: "Chưa cập nhật",
                diaChi: "Chưa cập nhật",
                email: emailGoogle,
                tenDangNhap: emailGoogle,
                matKhau: "google_login_social",
                role: "customer"
            });
        }
        return done(null, khach);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((u, d) => d(null, u));
passport.deserializeUser((o, d) => d(null, o));

// 5. Biến toàn cục cho View (Dùng locals để index.ejs không bị lỗi undefined)
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
    next();
});

// 6. Nạp các Routers (Để sau khi đã có Session/Passport)
const authRouter = require('./routers/auth');
const indexRouter = require('./routers/index');
const khachRouter = require('./routers/khachhang');
const adminRouter = require('./routers/nguoidung');

app.use('/', authRouter); // Xử lý login/register/google
app.use('/', indexRouter);
app.use('/khach', khachRouter); 
app.use('/admin', adminRouter);

// KẾT NỐI DATABASE
const uri = 'mongodb://admin:admin123@ac-qcf57uz-shard-00-02.krj8l7i.mongodb.net:27017/QL_BanSonDuong?ssl=true&authSource=admin';
mongoose.connect(uri)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
