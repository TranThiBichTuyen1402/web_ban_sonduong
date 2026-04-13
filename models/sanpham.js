const mongoose = require('mongoose');

const sanphamSchema = new mongoose.Schema({
    // Bạn phải viết CHÍNH XÁC là tenSon (chữ S viết hoa)
    tenSon: { type: String }, 
    gia: { type: Number },
    soLuongTon: { type: Number },
    moTa: { type: String },
    hinhAnh: { type: String },
    maHang: { type: mongoose.Schema.Types.ObjectId, ref: 'hangsanxuat' }
}, { collection: 'sanpham' });

module.exports = mongoose.model('sanpham', sanphamSchema);