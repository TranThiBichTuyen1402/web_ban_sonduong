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
        const { email, password } = req.body;

        // 1. Kiểm tra xem Email này đã có ai dùng chưa
        const checkUser = await khachhang.findOne({ email: email });
        
        if (checkUser) {
            // Nếu tìm thấy, báo lỗi ngay và không lưu nữa
            return res.send(`
                <script>
                    alert('Email này đã được đăng ký rồi, vui lòng dùng email khác!');
                    window.history.back(); // Quay lại trang trước để nhập lại
                </script>
            `);
        }

        // 2. Nếu chưa có thì mới tiến hành lưu
        const moi = new khachhang({ email, password });
        await moi.save();

        res.send(`
            <script>
                alert('Đăng ký tài khoản khách thành công!');
                window.location.href = '/login'; 
            </script>
        `);
    } catch (error) {
        console.error("Lỗi kết nối DB:", error);
        res.status(500).send("Lỗi kết nối Database, vui lòng kiểm tra lại Cluster MongoDB!");
    }
});
module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó
