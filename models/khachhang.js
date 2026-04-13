const mongoose = require('mongoose');

const khachhangSchema = new mongoose.Schema({
    tenKhachHang: { type: String, required: true },
    dienThoai: String,
    diaChi: String,
    email: { type: String, required: true, unique: true },
    tenDangNhap: { type: String, required: true, unique: true },
    matKhau: { type: String, required: true },
    // THÊM DÒNG NÀY ĐỂ PHÂN QUYỀN
    role: { type: String, default: 'customer' } 
}, { collection: 'khachhang' });

module.exports = mongoose.model('KhachHang', khachhangSchema);