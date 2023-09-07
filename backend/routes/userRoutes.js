const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  updatePass,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  createReview,
} = require("../controllers/userController");
const express = require("express");
const { isAuth, authoriseRoles } = require("../middlewares/Auth");
const { fileUpload } = require("../middlewares/multer.js");
const router = express.Router();

router.post("/register", fileUpload, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/myprofile", isAuth, getUserDetails);
router.put("/password/update", isAuth, fileUpload , updatePass);
router.put("/profile/update", isAuth, fileUpload, updateProfile);
router.get("/admin/users", isAuth, authoriseRoles("admin"), getAllUsers);
router.put("/addcomment", isAuth, createReview);
router
  .route("/admin/user/:id")
  .get(isAuth, authoriseRoles("admin"), getUserById)
  .put(isAuth, authoriseRoles("admin"), fileUpload  ,updateUserRole)
  .delete(isAuth, authoriseRoles("admin"), deleteUser);

module.exports = router;
