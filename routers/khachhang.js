var express = require('express');
var router = express.Router();
var sanpham = require('../models/sanpham');
const donhang = require('../models/donhang');

// 1. Thêm sản phẩm vào giỏ
router.get('/add-to-cart/:id', async (req, res) => {
    if (!req.session.user) return res.send("<script>alert('Vui lòng đăng nhập!'); window.location='/login';</script>");
    
    if (!req.session.cart) req.session.cart = [];
    
    const sp = await sanpham.findById(req.params.id);
    if (sp) {
        // Biến sp thành object thường và thêm số lượng mặc định là 1
        let item = sp.toObject();
        item.soLuong = 1; 
        req.session.cart.push(item);
    }
    res.send("<script>alert('Đã thêm vào giỏ hàng!'); window.location='/';</script>");
});

// 2. Xem giỏ hàng
router.get('/giohang', (req, res) => {
    const cart = req.session.cart || [];
    // Sửa lỗi: Nhân thêm soLuong khi tính tổng
    const tongCong = cart.reduce((total, item) => total + (item.gia * (item.soLuong || 1)), 0);
    res.render('giohang', { cart, tongCong });
});

// 3. Trang thanh toán (Lấy dữ liệu thật)
router.get('/thanh-toan', (req, res) => {
    const user = req.session.user;
    const cart = req.session.cart || [];
    
    if (!user) return res.redirect('/login');
    
    // Tính tổng tiền thật từ giỏ hàng để truyền sang trang thanh toán
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
        const user = req.session.user;
        const gioHang = req.session.cart || [];

        if (gioHang.length === 0) return res.send("Giỏ hàng trống!");

        const donHangMoi = new donhang({
            maKhachHang: user._id,
            tenNguoiNhan: hoTenNguoiNhan,
            ngayDat: new Date(),
            // Tính tổng tiền chuẩn
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
        req.session.cart = []; // Xóa giỏ hàng sau khi đặt thành công
        res.send("<script>alert('Đặt hàng thành công!'); window.location.href='/';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi: " + error.message);
    }
});

// 5. Xem lịch sử đơn hàng (Sau này bạn nên viết query tìm đơn theo maKhachHang)
router.get('/don-hang', async (req, res) => {
    try {
        const user = req.session.user; // Kiểm tra xem ai đang xem đơn
        if (!user) return res.redirect('/login'); // Chưa đăng nhập thì bắt đăng nhập

        // LẤY ĐƠN HÀNG THẬT TỪ DATABASE ĐÂY NÈ:
        const orders = await donhang.find({ maKhachHang: user._id }).sort({ ngayDat: -1 });

        // Gửi danh sách đó sang file giao diện (lichsudonhang.ejs)
        res.render('lichsudonhang', { orders: orders });
        
    } catch (err) {
        res.send("Lỗi rồi bạn ơi: " + err.message);
    }
});
// Xem chi tiết một đơn hàng cụ thể
router.get('/don-hang/chi-tiet/:id', async (req, res) => {
    try {
        // 1. Tìm đơn hàng theo ID từ URL
        const order = await donhang.findById(req.params.id);

        if (!order) {
            return res.send("Không tìm thấy đơn hàng!");
        }

        // 2. Render ra file giao diện chi tiết đơn hàng
        // Bạn cần tạo thêm file 'chitietdonhang.ejs' nhé
        res.render('chitietdonhang', { order: order });

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
});

module.exports = router;