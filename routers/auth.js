const express = require('express');
const router = express.Router();
const khachhang = require('../models/khachhang');
// 1. Route GET: Hiển thị trang đăng ký khi khách truy cập /register
router.get('/register', (req, res) => {
    res.render('register'); // Phải trùng tên với file register.ejs trong thư mục views
});

// 2. Route POST: Xử lý khi khách bấm nút "Đăng ký"
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body; // Lấy từ form HTML

        // 1. Kiểm tra xem khách đã tồn tại chưa
        const checkKhach = await khachhang.findOne({ email: email });
        if (checkKhach) {
            return res.send("<script>alert('Email này đã tồn tại!'); window.history.back();</script>");
        }

        // 2. Tạo đối tượng mới khớp y chang các trường trong hình image_0cff24.png
        const moi = new khachhang({
            tenKhachHang: "Khách hàng mới", // Tên mặc định hoặc lấy thêm từ form
            email: email,
            tenDangNhap: email,
            matKhau: password, // Trong hình của bạn là 'matKhau' chứ không phải 'password'
            role: "customer"
        });

        await moi.save();
        res.send("<script>alert('Đăng ký thành công!'); window.location.href='/login';</script>");
    } catch (error) {
        console.error("Lỗi rồi:", error);
        res.status(500).send("Lỗi kết nối Database! Hãy kiểm tra lại whitelist IP trên MongoDB Atlas.");
    }
});
module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó
