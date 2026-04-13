const express = require('express');
const router = express.Router();
const khachhang = require('../models/khachhang');
const passport = require('passport');

// --- ĐĂNG KÝ ---
router.get('/register', (req, res) => {
    res.render('login'); 
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword, tenKhachHang, dienThoai, diaChi } = req.body;

        if (password !== confirmPassword) {
            return res.send("<script>alert('Mật khẩu xác nhận không khớp!'); window.history.back();</script>");
        }

        const userTonTai = await khachhang.findOne({ email: email });
        if (userTonTai) {
            return res.send("<script>alert('Email này đã có người sử dụng!'); window.history.back();</script>");
        }

        const khachHangMoi = new khachhang({
            tenKhachHang,
            dienThoai: dienThoai || "",
            diaChi: diaChi || "",
            email,
            tenDangNhap: email,
            matKhau: password,
            role: "customer"
        });

        await khachHangMoi.save();
        res.send("<script>alert('Đăng ký thành công!'); window.location.href = '/login';</script>");

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).send("Lỗi hệ thống!");
    }
});

// --- ĐĂNG NHẬP GOOGLE (Chỗ này sửa lỗi Not Found) ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/'); 
    }
);

// --- ĐĂNG XUẤT ---
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });
});

module.exports = router;
