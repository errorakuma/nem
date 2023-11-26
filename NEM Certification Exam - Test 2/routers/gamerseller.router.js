const express = require("express");
const router = express.Router();
const GS = require("../controllers/gameseller.controller");

// Login

router.post("/login", GS.login);

// Register

router.post("/user", GS.user);

//Homepage API

router.get("/product", GS.products);

// Product Details:

router.get("/product/:id", GS.product);

// Save/Remove from Wishlist:

router.put("/wishlist", GS.wishlist);

//  Add/Remove from the Cart:

router.put("/cart", GS.cart);

// Place Order:
router.post("/order", GS.order);

//  View User Details:
router.get("/user/:username", GS.userdetails);

// update User Details:
// router.put("/updateuser", GS.updateuser);
router.put("/user", GS.updateuser);

// Seller Functionalities:
// Create Product

router.post("/product", GS.createProduct);

// update product Details:
// router.put("/updateproduct", GS.updateProduct);
router.put("/product", GS.updateProduct);

module.exports = router;
