const express = require("express");
const app = express();
require("dotenv").config();
console.log(process.env.PORT);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error ${err.message}`);
  console.log(`The Server Is Shutting Down Due To Uncaught Exception`);
  process.exit(1);
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "https://ecommerce-seven-green-80.vercel.app", credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));


//routes
const product = require("./routes/productRoutes.js");
const user = require("./routes/userRoutes.js");
const order = require("./routes/orderRoute.js");
const payments = require("./routes/paymentRoute.js");

// Route middlewares
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", payments);

module.exports = app;
