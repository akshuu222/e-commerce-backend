const express = require("express");
const { processPayments, sendStripeApiKey } = require("../controllers/paymentController");
const router = express.Router();
const {isAuth} = require("../middlewares/Auth.js")


router.post("/payment/process",isAuth,processPayments);
router.get("/stripeapikey",sendStripeApiKey);

module.exports = router