const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    discountID: { type: String, required: true },
    percentDiscount: { type: Number, required: true },
    discountCode: { type: String, required: true },
    discountName: { type: String, required: true },
    dateOfApplication: { type: Date, required: true },
    condition: { type: String, required: true }
});

module.exports = mongoose.model('Discount', discountSchema);
