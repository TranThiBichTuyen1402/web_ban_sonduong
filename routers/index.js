var express = require('express');
var router = express.Router();
var sanpham = require('./models/sanpham');
var khachhang = require('./models/khachhang');
var nguoidung = require('./models/nguoidung');

router.get('/', async (req, res) => {
    const ds = await sanpham.find();
    res.render('index', { sanpham: ds });
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
    const { email, password } = req.body; // 'email' ở đây là giá trị từ ô nhập liệu
    try {
        // Tìm user: Kiểm tra cả 2 bảng KhachHang và NguoiDung
        // Tìm ở cả 2 cột: email HOẶC tenDangNhap
        let user = await khachhang.findOne({
            $or: [{ email: email }, { tenDangNhap: email }],
            matKhau: password
        });

        if (!user) {
            user = await nguoidung.findOne({
                $or: [{ email: email }, { tenDangNhap: email }],
                matKhau: password
            });
        }

        if (user) {
            req.session.user = user;
            return req.session.save(() => {
                // Kiểm tra quyền Admin để chuyển hướng
                if (user.role === 'admin') {
                    return res.redirect('/admin/sanpham');
                }
                res.redirect('/');
            });
        }

        // Nếu không khớp
        res.send("<script>alert('Sai tài khoản hoặc mật khẩu!'); window.location='/login';</script>");
    } catch (err) {
        console.log("Lỗi Login:", err);
        res.status(500).send("Lỗi server");
    }
});

// THÊM ĐOẠN NÀY
router.get('/lien-he', (req, res) => {
    res.render('lienhe'); 
});
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

module.exports = router;
