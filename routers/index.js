var express = require('express');
var router = express.Router();
var sanpham = require('../models/sanpham');
var khachhang = require('../models/khachhang');
var nguoidung = require('../models/nguoidung');
var donhangModel = require('../models/donhang'); 

router.get('/', async (req, res) => {
    const ds = await sanpham.find();
    res.render('index', { sanpham: ds });
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
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
            // Khi đăng nhập tay, ta lưu vào session
            req.session.user = user;
            return req.session.save(() => {
                if (user.role === 'admin') return res.redirect('/admin/sanpham');
                res.redirect('/');
            });
        }
        res.send("<script>alert('Sai tài khoản hoặc mật khẩu!'); window.location='/login';</script>");
    } catch (err) {
        res.status(500).send("Lỗi server");
    }
});
// THÊM ĐOẠN NÀY
router.get('/lien-he', (req, res) => {
    res.render('lienhe'); 
});
router.get('/logout', (req, res) => { 
    if (req.logout) {
        req.logout(() => { 
            req.session.destroy(() => { 
                res.redirect('/'); 
            });
        });
    } else {
        req.session.destroy(() => { 
            res.redirect('/'); 
        });
    }
});
module.exports = router;
