var express = require('express');
var router = express.Router();
var sanpham = require('../models/sanpham');
const donhang = require('../models/donhang');

// Middleware hỗ trợ lấy thông tin user nhanh
const getLoggedUser = (req) => req.user || req.session.user;

// 1. Thêm sản phẩm vào giỏ
router.get('/add-to-cart/:id', async (req, res) => {
    const user = getLoggedUser(req);
    
    if (!user) {
        return res.send("<script>alert('Vui lòng đăng nhập!'); window.location='/login';</script>");
    }
    
    if (!req.session.cart) req.session.cart = [];
    
    const sp = await sanpham.findById(req.params.id);
    if (sp) {
        let item = sp.toObject();
        item.soLuong = 1; 
        req.session.cart.push(item);
    }
    res.send("<script>alert('Đã thêm vào giỏ hàng!'); window.location='/';</script>");
});
// Xóa sản phẩm khỏi giỏ hàng dựa trên vị trí (index)
router.get('/remove-from-cart/:index', (req, res) => {
    try {
        const index = req.params.index; // Lấy vị trí món đồ muốn xóa
        
        if (req.session.cart && req.session.cart.length > 0) {
            // Xóa 1 phần tử tại vị trí index
            req.session.cart.splice(index, 1);
        }

        // Xóa xong thì quay lại trang giỏ hàng
        res.redirect('/khach/giohang');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi xóa sản phẩm");
    }
});

// 2. Xem giỏ hàng
router.get('/giohang', (req, res) => {
    const cart = req.session.cart || [];
    const tongCong = cart.reduce((total, item) => total + (item.gia * (item.soLuong || 1)), 0);
    res.render('giohang', { cart, tongCong });
});

// 3. Trang thanh toán
router.get('/thanh-toan', (req, res) => {
    const user = getLoggedUser(req);
    const cart = req.session.cart || [];
    
    if (!user) return res.redirect('/login');
    
    const tongCong = cart.reduce((total, item) => total + (item.gia * (item.soLuong || 1)), 0);

    res.render('thanhtoan', { 
        user: user, 
        tongCong: tongCong 
    });
});

// 4. Xử lý lưu đơn hàng
router.post('/xac-nhan-dat-hang', async (req, res) => {
    try {
        const { hoTenNguoiNhan, soDienThoai, diaChi } = req.body;
        const user = getLoggedUser(req);
        const gioHang = req.session.cart || [];

        if (!user) return res.redirect('/login');
        if (gioHang.length === 0) return res.send("Giỏ hàng trống!");

        const donHangMoi = new donhang({
            maKhachHang: user._id, // Hoạt động tốt cho cả user ID từ DB hoặc Google
            tenNguoiNhan: hoTenNguoiNhan,
            ngayDat: new Date(),
            tongTien: gioHang.reduce((t, i) => t + (i.gia * (i.soLuong || 1)), 0),
            trangThai: "Chờ xác nhận",
            sdt: soDienThoai,
            diaChi: diaChi,
            chiTiet: gioHang.map(item => ({
                maSon: item._id,
                tenSon: item.tenSon,
                soLuong: item.soLuong || 1,
                gia: item.gia
            }))
        });

        await donHangMoi.save();
        req.session.cart = []; 
        res.send("<script>alert('Đặt hàng thành công!'); window.location.href='/';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi: " + error.message);
    }
});

// 5. Xem lịch sử đơn hàng
router.get('/don-hang', async (req, res) => {
    try {
        const user = getLoggedUser(req);
        if (!user) return res.redirect('/login');

        const orders = await donhang.find({ maKhachHang: user._id }).sort({ ngayDat: -1 });
        res.render('lichsudonhang', { orders: orders });
        
    } catch (err) {
        res.send("Lỗi: " + err.message);
    }
});

// 6. Xem chi tiết một đơn hàng
router.get('/don-hang/chi-tiet/:id', async (req, res) => {
    try {
        const order = await donhang.findById(req.params.id);
        if (!order) return res.send("Không tìm thấy đơn hàng!");
        res.render('chitietdonhang', { order: order });
    } catch (err) {
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
});
// 7. Xử lý khi khách bấm nút "Đã nhận được hàng"
router.post('/da-nhan-hang/:id', async (req, res) => {
    try {
        const user = getLoggedUser(req);
        if (!user) return res.redirect('/login');

        // Tìm đơn hàng của đúng user đó và cập nhật trạng thái
        await donhang.findOneAndUpdate(
            { _id: req.params.id, maKhachHang: user._id }, 
            { trangThai: 'Đã nhận hàng' }
        );

        res.redirect('/khach/don-hang'); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi cập nhật: " + err.message);
    }
});
module.exports = router;
