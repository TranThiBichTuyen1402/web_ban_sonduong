require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Model Khách hàng (Đảm bảo file này tồn tại trong folder models)
const khachhang = require('./models/khachhang'); 

// KẾT NỐI DATABASE
const uri = 'mongodb://admin:admin123@ac-qcf57uz-shard-00-02.krj8l7i.mongodb.net:27017/QL_BanSonDuong?ssl=true&authSource=admin';
mongoose.connect(uri).then(() => console.log("✅ DB Connected")).catch(err => console.log(err));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'bichtuyen_beauty',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// KÍCH HOẠT PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// CẤU HÌNH PASSPORT GOOGLE (Dùng biến môi trường)
passport.use(new (require('passport-google-oauth20').Strategy)({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL // <--- QUAN TRỌNG NHẤT LÀ DÒNG NÀY
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const emailGoogle = profile.emails[0].value;
        const tenGoogle = profile.displayName;

        let khach = await khachhang.findOne({ email: emailGoogle });
        if (!khach) {
            khach = await KhachHang.create({
                tenKhachHang: tenGoogle,
                dienThoai: "Chưa cập nhật",
                diaChi: "Chưa cập nhật",
                email: emailGoogle,
                tenDangNhap: emailGoogle,
                matKhau: "google_login_social",
                role: "customer"
            });
            console.log("✅ Đã tạo khách hàng mới từ Google");
        }
        return done(null, khach);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((u, d) => d(null, u));
passport.deserializeUser((o, d) => d(null, o));

// BIẾN TOÀN CỤC CHO VIEW
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.user = req.user;
    }
    res.locals.user = req.session.user || null;
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
    next();
});

// --- ROUTES CHO GOOGLE AUTH ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/')
);

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. In ra console để thầy (hoặc bạn) kiểm tra log trên Render
        console.log("Xử lý đăng ký cho email:", email);

        // 2. Logic lưu vào MongoDB (Nếu bạn đã có Model User)
        // await User.create({ email, password }); 

        // 3. Phản hồi chuyên nghiệp: Thông báo thành công và quay lại trang Login
        res.send(`
            <script>
                alert('Đăng ký tài khoản thành công!');
                window.location.href = '/login'; 
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi hệ thống khi đăng ký.");
    }
});
// CÁC ROUTER KHÁC
var indexRouter = require('./routers/index');
var khachRouter = require('./routers/khachhang');
var adminRouter = require('./routers/nguoidung');

app.use('/', indexRouter);
app.use('/khach', khachRouter); 
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3000; // Render sẽ cấp PORT tự động
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
