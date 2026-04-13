const express = require('express');
const router = express.Router();
const khachhang = require('../models/khachhang');
// 1. Route GET: Hiển thị trang đăng ký khi khách truy cập /register
router.get('/register', (req, res) => {
    res.render('login'); 
});

// 2. Route POST: Xử lý khi khách bấm nút "Đăng ký"
router.post('/register', async (req, res) => {
    try {
        // Lấy dữ liệu từ form (form của bạn cần có các name="email", name="password", etc.)
        const { email, password, tenKhachHang, dienThoai, diaChi } = req.body;

        // 1. Kiểm tra xem email đã tồn tại chưa
        const userTonTai = await khachhang.findOne({ email: email });
        if (userTonTai) {
            return res.send("<script>alert('Email này đã có người sử dụng!'); window.history.back();</script>");
        }

        // 2. Tạo bản ghi mới KHỚP VỚI DATABASE TRONG HÌNH
       // Trong router.post('/register', ...)
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
module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó
