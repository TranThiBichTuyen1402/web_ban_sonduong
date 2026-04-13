const express = require('express');
const router = express.Router();
const khachhang = require('./models/khachhang');
// 1. Route GET: Hiển thị trang đăng ký khi khách truy cập /register
router.get('/register', (req, res) => {
    res.render('login'); 
});

// 2. Route POST: Xử lý khi khách bấm nút "Đăng ký"
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword, tenKhachHang, dienThoai, diaChi } = req.body;

        // KIỂM TRA MẬT KHẨU KHỚP NHAU
        if (password !== confirmPassword) {
            return res.send("<script>alert('Mật khẩu xác nhận không khớp!'); window.history.back();</script>");
        }

        // Kiểm tra email tồn tại (giữ nguyên code cũ của bạn...)
        const userTonTai = await khachhang.findOne({ email: email });
        if (userTonTai) {
            return res.send("<script>alert('Email này đã có người sử dụng!'); window.history.back();</script>");
        }
        
        // ... code lưu DB phía dưới giữ nguyên
const khachHangMoi = new khachhang({
    tenKhachHang: tenKhachHang || "Người dùng mới", 
    dienThoai: dienThoai || "",
    diaChi: diaChi || "",
    email: email,
    tenDangNhap: email, // Giữ nguyên theo ý bạn
    matKhau: password,  // Database của bạn cột này tên là 'matKhau'
    role: "customer"
});

        // 3. Lưu vào MongoDB
        await khachHangMoi.save();

        res.send(`
            <script>
                alert('Đăng ký thành công!');
                window.location.href = '/login';
            </script>
        `);

    } catch (error) {
        console.error("Lỗi lưu DB:", error);
        res.status(500).send("Lỗi hệ thống: Không thể kết nối Database!");
    }
});
const passport = require('passport');

// Đường dẫn bắt đầu đăng nhập Google
router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Đường dẫn Google trả dữ liệu về (Fix lỗi Not Found)
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); // Xong thì về trang chủ
    }
);

// Đường dẫn Đăng xuất
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó
