const express = require('express');
const router = express.Router();
// const User = require('../models/User'); // Mở ra nếu bạn đã có Model User

// 1. Route GET: Hiển thị trang đăng ký khi khách truy cập /register
router.get('/register', (req, res) => {
    res.render('register'); // Phải trùng tên với file register.ejs trong thư mục views
});

// 2. Route POST: Xử lý khi khách bấm nút "Đăng ký"
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("Hệ thống nhận yêu cầu đăng ký cho:", email);

        // Logic lưu vào database (Bạn nên mở cái này ra khi đã có Model)
        /*
        const newUser = new User({ email, password });
        await newUser.save();
        */

        // Phản hồi chuyên nghiệp
        res.send(`
            <script>
                alert('Đăng ký tài khoản thành công!');
                window.location.href = '/login'; 
            </script>
        `);
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).send("Lỗi hệ thống khi đăng ký tài khoản.");
    }
});

module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó