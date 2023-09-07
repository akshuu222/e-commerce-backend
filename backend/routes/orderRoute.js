const express = require("express");
const router = express.Router();

//auth
const { isAuth, authoriseRoles } = require("../middlewares/Auth.js");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController.js");

router.route("/order/new").post(isAuth, newOrder);
router.route("/orders/me").get(isAuth, myOrders);
router
  .route("/admin/orders")
  .get(isAuth, authoriseRoles("admin"), getAllOrders);
router
  .route("/admin/order/:id")
  .put(isAuth, authoriseRoles("admin"), updateOrderStatus)
  .delete(isAuth, authoriseRoles("admin"), deleteOrder);
router.route("/order/:id").get(isAuth, getSingleOrder);

module.exports = router;
