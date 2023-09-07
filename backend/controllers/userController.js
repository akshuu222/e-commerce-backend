const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken.js");
// const sendMail = require("../utils/sendMail.js");
// const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { getDataUri } = require("../utils/dataParser.js");

//register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let myCloud;
    if (req.files.length !== 0) {
      const fileUri = getDataUri(req.files[0]);
      myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        folders: "avatars",
        width: 150,
        crop: "scale",
      });
    }
    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User Already Exists", 400));

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud?.public_id ? myCloud?.public_id : "",
        url: myCloud?.secure_url ? myCloud?.secure_url : "",
      },
    });
    sendToken(user, res, 201, "Registered Successfully", next);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Enter Email And Password", 400));
    let user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Please Register First", 400));
    const isMatch = await user.passCheck(password);
    if (!isMatch)
      return next(new ErrorHandler("Password or Email Is Incorrect", 401));
    sendToken(user, res, 200, "Logined Successfully", next);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res
      .cookie("token", null, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now()),
      })
      .status(200)
      .json({ message: true, message: "Logout Successfully" });
  } catch (error) {
    next(error);
  }
};

// const forgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return next(new ErrorHandler("No User Found", 404));
//     const token = user.generateToken();
//     await user.save({ validateBeforeSave: false });
//     const sendURL = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/password/reset/${token}`;

//     const message = `Your Password Reset Token Is :- \n\n ${sendURL} \n\n In You have Not Send Plese Contact Us`;
//     try {
//       await sendMail({
//         email,
//         subject: "Ecommerce Password Recovery",
//         message,
//       });
//       res.status(200).json({
//         success: true,
//         message: `Reset Password Sent To ${email} successfully`,
//       });
//     } catch (error) {
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpire = undefined;
//       await user.save({ validateBeforeSave: false });
//       return next(new ErrorHandler(error.message, 500));
//     }
//   } catch (error) {
//     return next(error);
//   }
// };

// const resetPassword = async () => {
//   try {
//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user)
//       next(
//         new ErrorHandler(
//           "Reset Password token is Invalid Or Has been Expired",
//           400
//         )
//       );

//     if (req.body.newPassword !== req.password.confirmPassword)
//       next(new ErrorHandler("Password Doesnot Match ", 400));

//     user.password = req.body.newPassword;
//     user.resetPasswordExpire = undefined;
//     user.resetPasswordToken = undefined;
//     user.save();

//     sendToken(user, res, 200, "Logined Successfully", next);
//   } catch (error) {
//     return next(error);
//   }
// };

const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ message: true, user: user });
  } catch (error) {
    return next(error);
  }
};

const updatePass = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.passCheck(req.body.oldpassword);

    if (!isMatch)
      return next(new ErrorHandler("OldPassword is Incorrect", 400));

    if (req.body.newpassword !== req.body.confirmpassword)
      return next(new ErrorHandler("Password Doesnot Match", 400));

    user.password = req.body.newpassword;
    await user.save();
    sendToken(user, res, 200, "Password Changed Successfully", next);
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.files.length !== 0) {
      const user = await User.findById(req.user.id);
      const imageId = user.avatar.public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
      const imageUri = getDataUri(req.files[0]);
      const mycloud = await cloudinary.v2.uploader.upload(imageUri.content, {
        folders: "avatars",
        width: 150,
        crop: "scale",
      });

      newUserData.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully", user });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, users });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(
        new ErrorHandler(`User DoesNot Exists with ID ${req.params.id}`, 400)
      );
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(
        new ErrorHandler(`User DoesNot Exists with ID ${req.params.id}`, 400)
      );

    if (user.avatar.public_id) {
      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);
    }

    await User.deleteOne({ _id: user.id });
    res
      .status(200)
      .json({ success: true, message: "User Deleted Successfully" });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ success: true, user, message: "User Updated Successfully" });
  } catch (error) {
    return next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { rating, comment, productid } = req.body;
    const review = {
      userid: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await Product.findById(productid);

    const isReviewed = product.reviews.find(
      (rev) => rev.userid.toString() === req.user.id.toString()
    );
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.userid.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
          rev.postedon = new Date(Date.now());
        }
      });
    } else {
      product.reviews.push(review);
      product.numberofreviews = product.reviews.length;
    }
    product.ratings =
      product.reviews.reduce((acc, crr) => acc + crr.rating, 0) /
      product.reviews.length;
    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true , message:"Review added successfully" });
  } catch (error) {
    return next(error);
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) return next(new ErrorHandler("No Product Found", 400));
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(error);
  }
};

const deleteReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productid);
    if (!product) return next(new ErrorHandler("No Product Found", 400));

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
    const ratings =
      reviews.reduce((acc, crr) => acc + crr.rating, 0) / reviews.length;
    const numberofreviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productid,
      {
        reviews,
        ratings,
        numberofreviews,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
  getAllReviews,
  deleteReviews,
};
