const mongoose = require("mongoose");
const env = require("dotenv").config();

const products = require("../models/product");

mongoose
  .connect(process.env.DATABASE_URL)

  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err.message);
  });

const db = mongoose.connection;

db.once("open", async () => {
  // console.log("Database connected:", process.env.DATABASE_URL);

  try {
    const count = await products.countDocuments({});

    if (count === 0) {
      await products.insertMany([
        {
          _id: "1",
          title: "Call of Duty",
          thumbnailURL:
            "https://gamerrentals.in/wp-content/uploads/2020/10/51PvGjV6D5L._SL1000_.jpg",
          sellerUsername: "seisi",
          unitsAvailable: 10,
          productType: "game",
          productImages: [],
          rentalPricePerWeek: 200,
          rentalPricePerMonth: 700,
        },
        {
          _id: "2",
          title: "Microsoft Xbox",
          thumbnailURL:
            "https://gamerrentals.in/wp-content/uploads/2020/09/ddb84cea-92b0-4f66-8369-31865df14fe5.jpg",
          sellerUsername: "leon",
          unitsAvailable: 10,
          productType: "console",
          productImages: [],
          rentalPricePerWeek: 300,
          rentalPricePerMonth: 1000,
        },
        {
          _id: "3",
          title: "PS4 Dualshock",
          thumbnailURL:
            "https://gamerrentals.in/wp-content/uploads/2020/09/31BUiVHy6L.jpg",
          sellerUsername: "rben",
          unitsAvailable: 10,
          productType: "controller",
          productImages: [],
          rentalPricePerWeek: 250,
          rentalPricePerMonth: 900,
        },
      ]);

      console.log("Documents inserted successfully");
    } else {
      // console.log("Product collection is not empty. No documents inserted.");
    }
  } catch (err) {
    console.error("Error during setup:", err);
  }
});

db.on("error", (err) => {
  console.error("Connection error:", err);
});

module.exports = mongoose;
