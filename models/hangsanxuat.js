const mongoose = require('mongoose');

const hangsanxuatSchema = new mongoose.Schema({
    tenHang: { type: String, required: true },
    diaChi: { type: String }
}, { collection: 'hangsanxuat' }); //do tự tạo collection bằng tay

module.exports = mongoose.model('hangsanxuat', hangsanxuatSchema);