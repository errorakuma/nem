const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let validator = require("validator");
const SellerSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  username: { type: String, lowercase: true, unique: true },
  firstName: String,
  lastName: String,
  contactNumber: String,
  password: String,
  userType: { type: String, uppercase: true },
});

module.exports = mongoose.model("sellers", SellerSchema);
