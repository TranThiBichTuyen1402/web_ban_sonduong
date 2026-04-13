const express = require('express');
const router = express.Router();
const sanpham = require('../models/sanpham');
const hangsanxuat = require('../models/hangsanxuat'); // Cần để load danh sách hãng khi thêm/sua
const khachhang = require('../models/khachhang');
const donhang = require('../models/donhang');
//sử dụng thư viện multer để có thể thêm san phâm ở bất ký thư mục nào
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/HinhAnh'); // đem ảnh lưu vào public/HinhAnh
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname); // tên file = thời gian hiện tại + tên file góc
    }
});
const upload = multer({ storage: storage });

// 1. TRANG DANH SÁCH (READ)
router.get('/sanpham', async (req, res) => { //Khi admin vào san phẩm
    try {
        const ds = await sanpham.find();
        res.render('admin_ds_sanpham', { sanpham: ds });
    } catch (err) {
        res.status(500).send("Lỗi tải danh sách");
    }
});

// 2. THÊM SẢN PHẨM (CREATE)
// Giao diện thêm
router.get('/them', async (req, res) => {
    const dsHang = await hangsanxuat.find();
    res.render('admin_them_sanpham', { hang: dsHang });
});
// Xử lý lưu
router.post('/them', upload.single('HinhAnhFile'), async (req, res) => {
    try {
        let duongDanAnh = "";
        
        // Kiểm tra nếu có file tải lên
        if (req.file) {
            duongDanAnh = "HinhAnh/" + req.file.filename;
        } 
        // Nếu không có file, kiểm tra xem người dùng có dán link vào ô text không
        else if (req.body.hinhAnh) {
            duongDanAnh = req.body.hinhAnh;
        } 
        // Nếu trống hết thì để ảnh mặc định
        else {
            duongDanAnh = "HinhAnh/default.jpg";
        }

        // Tạo object dữ liệu cẩn thận, tránh dùng trực tiếp req.body
        const duLieuMoi = {
            tenSon: req.body.tenSon,
            gia: req.body.gia,
            soLuongTon: req.body.soLuongTon,
            moTa: req.body.moTa,
            maHang: req.body.maHang,
            hinhAnh: duongDanAnh // Gán đường dẫn ảnh đã xử lý ở trên vào đây
        };

        const moi = new sanpham(duLieuMoi);
        await moi.save();
        res.redirect('/admin/sanpham');
    } catch (err) {
        // Log lỗi ra màn hình đen (Terminal) để dễ debug
        console.error("Lỗi chi tiết:", err);
        res.send("Lỗi thêm sản phẩm: " + err.message);
    }
});
// 3. SỬA SẢN PHẨM (UPDATE)
router.post('/sua/:id', upload.single('HinhAnhFile'), async (req, res) => {
    try {
        const updateData = {
            tenSon: req.body.tenSon,
            gia: req.body.gia,
            soLuongTon: req.body.soLuongTon,
            maHang: req.body.maHang,
            moTa: req.body.moTa
        };

        // Nếu người dùng có chọn file ảnh mới
        if (req.file) {
            updateData.hinhAnh = "HinhAnh/" + req.file.filename;
        }

        await sanpham.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/sanpham');
    } catch (err) {
        res.send("Lỗi cập nhật: " + err.message);
    }
});
// HIỆN FORM SỬA SẢN PHẨM (GET)
router.get('/sua/:id', async (req, res) => {
    try {
        // 1. Tìm sản phẩm muốn sửa dựa vào ID trên URL
        const sp = await sanpham.findById(req.params.id);
        
        // 2. Lấy danh sách hãng để hiện trong ô chọn (Dropdown)
        const dsHang = await hangsanxuat.find();

        if (sp) {
            // 3. Mở file admin_sua_sanpham.ejs và truyền dữ liệu sản phẩm qua
            res.render('admin_sua_sanpham', { 
                sp: sp, 
                hang: dsHang 
            });
        } else {
            res.send("Không tìm thấy sản phẩm này!");
        }
    } catch (err) {
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
});
// 4. XÓA SẢN PHẨM (DELETE)
router.get('/xoa/:id', async (req, res) => {
    try {
        await sanpham.findByIdAndDelete(req.params.id);
        res.redirect('/admin/sanpham');
    } catch (err) {
        res.send("Lỗi xóa sản phẩm");
    }
});

// Trang tồn kho
router.get('/tonkho', async (req, res) => {
    const ds = await sanpham.find();
    res.render('admin_tonkho', { sanpham: ds });
});

router.post('/cap-nhat-kho/:id', async (req, res) => {
    try {
        const { soLuongMoi } = req.body;
        await sanpham.findByIdAndUpdate(req.params.id, { soLuongTon: soLuongMoi });
        res.redirect('/admin/tonkho');
    } catch (err) {
        res.send("Lỗi cập nhật số lượng");
    }
});
// Quản lý khách hàng
router.get('/khachhang', async (req, res) => {
    try {
        const ds = await khachhang.find();
        res.render('admin_khachhang', { customers: ds });
    } catch (err) {
        res.send("Lỗi tải danh sách khách hàng");
    }
});
// Route duyệt đơn
// File: routers/nguoidung.js
router.get('/duyet-don', async (req, res) => {
    try {
        const orders = await donhang.find().sort({ ngayDat: -1 });
        // Dòng này lệnh cho Express tìm file 'duyetdon.ejs' trong folder views
        res.render('duyetdon', { orders: orders }); 
    } catch (err) {
        res.send("Lỗi: " + err.message);
    }
});

router.get('/cap-nhat-trang-thai/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;

        if (status === 'delete') {
            // Lệnh này sẽ xóa hẳn đơn hàng khỏi MongoDB
            await donhang.findByIdAndDelete(id);
        } else {
            // Lệnh này vẫn giữ lại để Duyệt đơn như bình thường
            await donhang.findByIdAndUpdate(id, { trangThai: status });
        }

        res.redirect('/admin/duyet-don'); 
    } catch (err) {
        res.send("Lỗi xử lý đơn hàng: " + err.message);
    }
});
module.exports = router;