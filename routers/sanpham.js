var express = require('express');
var router = express.Router();
var sanpham = require('../models/sanpham');

// GET: Danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        var sp = await sanpham.find();
        res.render('sanpham', {
            title: 'Danh sách sản phẩm',
            sanpham: sp
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
});

// GET: Thêm sản phẩm
router.get('/them', (req, res) => {
    res.render('sanpham_them', { title: 'Thêm sản phẩm' });
});

// POST: Thêm sản phẩm
router.post('/them', async (req, res) => {
    try {
        var data = {
            tenSanPham: req.body.tenSanPham,
            gia: Number(req.body.gia) || 0,
            soLuongTon: Number(req.body.soLuongTon) || 0,
            hinhAnh: req.body.hinhAnh || 'https://via.placeholder.com/200',
            moTa: req.body.moTa
        };
        await sanpham.create(data);
        res.redirect('/sanpham');
    } catch (err) {
        console.error(err);
        res.status(500).send('Không thể thêm sản phẩm');
    }
});

// GET: Sửa sản phẩm
router.get('/sua/:id', async (req, res) => {
    try {
        var sp = await sanpham.findById(req.params.id);
        if (!sp) return res.status(404).send('Sản phẩm không tồn tại');
        res.render('sanpham_sua', {
            title: 'Sửa sản phẩm',
            sanpham: sp
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
});

// POST: Sửa sản phẩm
router.post('/sua/:id', async (req, res) => {
    try {
        var data = {
            tenSanPham: req.body.tenSanPham,
            gia: Number(req.body.gia) || 0,
            soLuongTon: Number(req.body.soLuongTon) || 0,
            hinhAnh: req.body.hinhAnh || 'https://via.placeholder.com/200',
            moTa: req.body.moTa
        };
        await sanpham.findByIdAndUpdate(req.params.id, data);
        res.redirect('/sanpham');
    } catch (err) {
        console.error(err);
        res.status(500).send('Không thể cập nhật sản phẩm');
    }
});

// GET: Xóa sản phẩm
router.get('/xoa/:id', async (req, res) => {
    try {
        await sanpham.findByIdAndDelete(req.params.id);
        res.redirect('/sanpham');
    } catch (err) {
        console.error(err);
        res.status(500).send('Không thể xóa sản phẩm');
    }
});

module.exports = router;