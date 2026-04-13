const mongoose = require('mongoose');

const nguoidungSchema = new mongoose.Schema({
    tenDangNhap: String,
    matKhau: String,
    hoTen: String,
    email: String,
    role: String
}, { collection: 'nguoidung' });

module.exports = mongoose.model('nguoidung', nguoidungSchema);