const mongoose = require('mongoose'); // THIẾU DÒNG NÀY LÀ BỊ LỖI NGAY

const donHangSchema = new mongoose.Schema({
    maKhachHang: { type: mongoose.Schema.Types.ObjectId, ref: 'khachhang', required: true },
    tenNguoiNhan: { type: String, required: true },
    ngayDat: { type: Date, default: Date.now },
    tongTien: { type: Number, required: true },
    trangThai: { type: String, default: 'Chờ xác nhận' },
    sdt: { type: String, required: true },
    diaChi: { type: String, required: true },
    chiTiet: [
        {
            maSon: { type: mongoose.Schema.Types.ObjectId, ref: 'sanpham' },
            tenSon: String,
            soLuong: Number,
            gia: Number
        }
    ]
}, { collection: 'donhang' });

module.exports = mongoose.model('donhang', donHangSchema);