var express = require('express');
var router = express.Router();
var hoadon = require('../models/hoadon');
var chitiethoadon = require('../models/chitiethoadon');

// GET: Danh sách hóa đơn
router.get('/', async (req, res) => {
    var hd = await hoadon.find().populate('khachhang').exec();
    res.render('hoadon', { title: 'Danh sách hóa đơn', hoadon: hd });
});

// POST: Tạo hóa đơn mới
router.post('/them', async (req, res) => {
    var hd = await hoadon.create({
        khachhang: req.body.khachhang,
        NgayLap: new Date()
    });
    // Chi tiết hóa đơn
    for (let sp of req.body.sanpham) {
        await chitiethoadon.create({
            hoadon: hd._id,
            sanpham: sp.id,
            SoLuong: sp.soLuong,
            DonGia: sp.gia
        });
    }
    res.redirect('/hoadon');
});

module.exports = router;