const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
    maxLength: [8, "Price cannot Exceed 8 Characters"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please Enter Product category"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter Product Stock"],
    default: 1,
    maxLength: [4, "Stock cannot Exceed 4 Characters"],
  },
  numberofreviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      userid: {
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
      },
      postedon:{
        type:Date,
        default:Date.now()
      }
    },
  ],

  user: {
    type:mongoose.Types.ObjectId,
    required:true,
    ref:"User",
  },
  createdat: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("products", productSchema);
module.exports = Product;
