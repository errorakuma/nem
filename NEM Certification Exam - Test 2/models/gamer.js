const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let validator = require("validator");
const GamerSchema = new Schema({
  // _id: {
  // type: String,
  // lowercase: true,
  // },
  email: {
    type: String,
    lowercase: true,
    unique: true,

    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  username: { type: String, lowercase: true },
  firstName: String,
  lastName: String,
  contactNumber: String,
  password: String,
  userType: { type: String, uppercase: true },
  wishlist: [Object],
  cart: [Object],
});

module.exports = mongoose.model("gamers", GamerSchema);
