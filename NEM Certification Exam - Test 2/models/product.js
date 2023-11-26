const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  _id: {
    type: String,
    lowercase: true,
  },
  title: String,
  thumbnailURL: String,
  sellerUsername: String,
  unitsAvailable: Number,
  productType: String,
  productImages: [String],
  rentalPricePerWeek: Number,
  rentalPricePerMonth: Number,
});

module.exports = mongoose.model("products", ProductSchema);
