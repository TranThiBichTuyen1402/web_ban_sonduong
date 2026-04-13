const express = require('express');
const router = express.Router();
const sanpham = require('../models/sanpham');
const hangsanxuat = require('../models/hangsanxuat');

// 1. Trang chủ
router.get('/', async (req, res) => {
    try {
        const ds = await sanpham.find(); 
        res.render('index', { 
            sanpham: ds, 
            user: req.session ? req.session.user : null 
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Lỗi tải trang chủ");
    }
});

// 2. Xử lý khi bấm nút "Mua ngay"
router.get('/add-to-cart/:id', async (req, res) => {
    // Kiểm tra nếu chưa đăng nhập thì không cho mua
    if (!req.session || !req.session.user) {
        return res.send("<script>alert('Vui lòng đăng nhập để mua hàng!'); window.location='/login';</script>");
    }

    try {
        const productID = req.params.id;

        // Nếu giỏ hàng trong session chưa có thì tạo mảng mới
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Tìm sản phẩm trong database
        const sp = await sanpham.findById(productID);
        
        if (sp) {
            // Đưa sản phẩm vào giỏ hàng
            req.session.cart.push(sp);
            
            // Hiện thông báo và quay lại trang chủ
            res.send("<script>alert('Đã thêm " + sp.tenSon + " vào giỏ hàng!'); window.location='/';</script>");
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi hệ thống khi thêm giỏ hàng");
    }
});

// 3. Trang giỏ hàng (Để khi bấm vào Menu Giỏ hàng nó có dữ liệu)
router.get('/giohang', (req, res) => {
    const cart = req.session.cart || [];
    let tongCong = 0;
    cart.forEach(item => {
        tongCong += item.gia;
    });

    res.render('giohang', { 
        cart: cart, 
        tongCong: tongCong 
    });
});

module.exports = router;