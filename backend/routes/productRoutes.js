const express = require("express");
const router = express.Router();

//auth
const { isAuth, authoriseRoles } = require("../middlewares/Auth.js");

//controllers
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAdminProducts,
  featuredProduct,
} = require("../controllers/productController.js");
const {
  getAllReviews,
  deleteReviews,
} = require("../controllers/userController.js");
const { fileUpload } = require("../middlewares/multer.js");

router.get("/products", getProducts);
router.get("/featuredProduct", featuredProduct);
router.get(
  "/admin/products",
  isAuth,
  authoriseRoles("admin"),
  getAdminProducts
);
router.post(
  "/admin/product/add",
  isAuth,
  authoriseRoles("admin"),
  fileUpload,
  createProduct
);
router
  .route("/admin/product/:id")
  .put(isAuth, authoriseRoles("admin"), fileUpload  ,updateProduct)
  .delete(isAuth, authoriseRoles("admin"), deleteProduct);
router.get("/product/:id", getSingleProduct);
router.route("/reviews").get(getAllReviews).delete(isAuth, deleteReviews);

module.exports = router;
