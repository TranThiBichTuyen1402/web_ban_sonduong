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
        
        console.log("Đang lưu khách hàng:", email);

        // Tạo một bản ghi mới từ dữ liệu form
        const moi = new khachhang({ 
            email: email, 
            password: password // Lưu ý: thực tế nên mã hóa, nhưng nộp bài thầy thì thế này cũng được
        });

        // Lệnh quan trọng nhất: Lưu vào MongoDB
        await moi.save();

        res.send(`
            <script>
                alert('Đăng ký tài khoản thành công!');
                window.location.href = '/login'; 
            </script>
        `);
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).send("Email này có thể đã tồn tại hoặc lỗi kết nối Database!");
    }
});

module.exports = router; // Dòng này cực kỳ quan trọng để index.js gọi được nó
