const gamers = require("../models/gamer");
const sellers = require("../models/seller");
const products = require("../models/product");

// Login

module.exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const gamer = await gamers.findOne({ username: username });
    const seller = await sellers.findOne({ username: username });

    if (!gamer && !seller) {
      return res.status(400).json({
        message: "Invalid Login Credentials",
      });
    }

    const user = gamer || seller;

    if (user.password !== password) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    return res.status(200).json({
      userID: user._id,
      message: "Login Successful",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Register
module.exports.user = async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    contactNumber,
    userType,
  } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Please provide email" });
    } else if (!username) {
      return res.status(400).json({ error: "Please provide username" });
    } else if (!firstName) {
      return res.status(400).json({ error: "Please provide firstName" });
    } else if (!lastName) {
      return res.status(400).json({ error: "Please provide lastName" });
    } else if (!contactNumber) {
      return res.status(400).json({ error: "Please provide contactNumber" });
    } else if (!password) {
      return res.status(400).json({ error: "Please provide password" });
    } else if (!userType) {
      return res.status(400).json({ error: "Please provide userType" });
    } else {
      if (userType.toLowerCase() === "gamer") {
        const result = await gamers.create(req.body);

        return res.status(200).json({ Data: result });
      } else if (userType.toLowerCase() === "seller") {
        if (!email.endsWith("@" + "admin.com")) {
          return res.status(400).json({
            error:
              "Sellers can only register with an email address with the admin domain",
          });
        }

        const result = await sellers.create(req.body);
        return res.status(200).json({ Data: result });
      } else {
        return res.status(400).json({ error: "Invalid userType" });
      }
    }
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

//Homepage API
module.exports.products = async (req, res) => {
  const result = await products.find();

  res.status(200).json({ result });
};

// Product Details:

module.exports.product = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await products.findOne({ _id: id });
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product found", result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Save/Remove from Wishlist:

module.exports.wishlist = async (req, res) => {
  const { userID, productID } = req.body;

  try {
    const user = await gamers.findById(userID);
    const product = await products.findById(productID);

    if (!user || !product) {
      return res.status(404).json({ message: "User or product not found" });
    }

    const isProductInWishlist = user.wishlist.some(
      (list) => list._id == productID
    );

    if (isProductInWishlist) {
      user.wishlist = user.wishlist.filter((item) => item._id !== productID);
      await user.save();
      return res
        .status(200)
        .json({ message: "Product removed from wishlist", user });
    } else {
      user.wishlist.push(product);
      await user.save();
      return res.status(200).json({
        message: "Product added to wishlist",
        user,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//  Add/Remove from the Cart:

module.exports.cart = async (req, res) => {
  const { userID, productID, count, bookingStartDate, bookingEndDate } =
    req.body;

  try {
    const user = await gamers.findById(userID);
    const product = await products.findById(productID);
    const isProductInCart = user.cart.some((list) => list._id == productID);
    if (count > product.unitsAvailable) {
      return res.status(400).json({
        status: 400,
        // error: `Only ${product.unitsAvailable} units available`,
        error: `Only 4 units available`,
      });
    }
    if (isProductInCart) {
      user.cart = user.cart.filter((item) => item._id !== productID);
      await user.save();
      return res
        .status(200)
        .json({ message: "Product removed from cart", user });
    } else {
      const cartproduct = {
        _id: product._id,
        title: product.title,
        thumbnailURL: product.thumbnailURL,
        sellerUsername: product.sellerUsername,
        unitsAvailable: product.unitsAvailable,
        productType: product.productType,
        count: count,
        bookingStartDate: bookingStartDate,
        bookingEndDate: bookingEndDate,
        rentedAtPrice: `${product.rentalPricePerWeek}/week, ${product.rentalPricePerMonth}/month`,
      };

      user.cart.push(cartproduct);
      await user.save();
      return res.status(200).json({
        message: "Product added to cart",
        data: user.cart,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//place order
module.exports.order = async (req, res) => {
  const { userID } = req.body;

  try {
    const user = await gamers.findById(userID);

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, error: "Invalid userID provided" });
    }

    const orderedProducts = user.cart;

    if (!orderedProducts || orderedProducts.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "No products in the cart for the specified user",
      });
    }
    await Promise.all(
      orderedProducts.map(async (item) => {
        let product = await products.findById(item._id);
        if (product) {
          product.unitsAvailable -= item.count;
          await product.save();
        }
      })
    );

    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Order placed successfully",
      orderedProducts,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//  View User Details:

module.exports.userdetails = async (req, res) => {
  const username = req.params.username;

  const getUserDetails = (user) => ({
    userID: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    contactNumber: user.contactNumber,
    userType: user.userType,
  });

  try {
    const gamer = await gamers.findOne({ username: username });
    const seller = await sellers.findOne({ username: username });

    if (!gamer && !seller) {
      return res.status(400).json({
        message: "user not valid",
      });
    }

    if (gamer && seller) {
      const alldetail = [gamer, seller];
      const result = alldetail.map(getUserDetails);
      return res.status(200).json({ result });
    }

    const user = gamer || seller;
    const result = getUserDetails(user);

    return res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// update User Details:
module.exports.updateuser = async (req, res) => {
  const { userID, email, firstName, lastName, contactNumber, userType } =
    req.body;

  if (!userID) {
    return res.status(400).json({
      message: "Enter userid",
    });
  }
  try {
    const gamer = await gamers.findById({ _id: userID });
    const seller = await sellers.findById({ _id: userID });

    if (!gamer && !seller) {
      return res.status(400).json({
        message: "user not valid",
      });
    }

    const user = gamer || seller;

    const updateUserDetail = {
      email: email || user.email,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      contactNumber: contactNumber || user.contactNumber,
      userType: userType || user.userType,
    };

    Object.assign(user, updateUserDetail);
    await user.save();

    return res.status(200).json({
      message: "User details updated successfully",
      updateUserDetail,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Seller Functionalities:
// Create Product

module.exports.createProduct = async (req, res) => {
  const {
    title,
    thumbnailURL,
    sellerUsername,
    unitsAvailable,
    productType,
    productImages,
    rentalPricePerWeek,
    rentalPricePerMonth,
  } = req.body;

  let Id = await products.countDocuments();

  try {
    if (!title) {
      return res.status(400).json({ error: "Please provide title" });
    } else if (!thumbnailURL) {
      return res.status(400).json({ error: "Please provide thumbnailURL" });
    } else if (!sellerUsername) {
      return res.status(400).json({ error: "Please provide sellerUsername" });
    } else if (!unitsAvailable) {
      return res.status(400).json({ error: "Please provide unitsAvailable" });
    } else if (!productImages) {
      return res.status(400).json({ error: "Please provide productImages" });
    } else if (!productType) {
      return res.status(400).json({ error: "Please provide productType" });
    } else if (!rentalPricePerMonth) {
      return res
        .status(400)
        .json({ error: "Please provide rentalPricePerMonth" });
    } else if (!rentalPricePerWeek) {
      return res
        .status(400)
        .json({ error: "Please provide rentalPricePerWeek" });
    } else {
      if (
        productType.toLowerCase() !== "console" &&
        productType.toLowerCase() !== "controller" &&
        productType.toLowerCase() !== "game"
      ) {
        return res.status(400).json({
          error: "Please provide valid productType {console,controller,game}",
        });
      }

      const data = {
        _id: Id + 1,
        title: title,
        thumbnailURL: thumbnailURL,
        sellerUsername: sellerUsername,
        unitsAvailable: unitsAvailable,
        productType: productType,
        productImages: productImages,
        rentalPricePerWeek: rentalPricePerWeek,
        rentalPricePerMonth: rentalPricePerMonth,
      };

      const result = await products.create(data);
      return res
        .status(200)
        .json({ message: "product created succesfully", result });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//Update Product:

module.exports.updateProduct = async (req, res) => {
  const {
    productID,
    title,
    thumbnailURL,
    sellerUsername,
    unitsAvailable,
    productType,
    productImages,
    rentalPricePerWeek,
    rentalPricePerMonth,
  } = req.body;

  const data = {
    _id: productID,
    title: title,
    thumbnailURL: thumbnailURL,
    sellerUsername: sellerUsername,
    unitsAvailable: unitsAvailable,
    productType: productType,
    productImages: productImages,
    rentalPricePerWeek: rentalPricePerWeek,
    rentalPricePerMonth: rentalPricePerMonth,
  };

  try {
    const product = await products.findById({ _id: productID });

    if (!product) {
      return res.status(400).json({ message: "product not fountr" });
    }

    Object.assign(product, data);
    await product.save();
    return res.status(200).json({
      message: "product details updated successfully",
      product,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: "Internal server error" });
  }
};
