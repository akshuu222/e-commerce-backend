const Product = require("../models/productModel.js");
const ApiFeatures = require("../utils/apiFeatures.js");
const { getDataUri } = require("../utils/dataParser.js");
const ErrorHandler = require("../utils/errorHandler.js");
const cloudinary = require("cloudinary");
//create Product -- Admin
const createProduct = async (req, res, next) => {
  try {
    const imageLink = [];

    if (req.files.length !== 0) {
      for (let temp of req.files) {
        const fileUri = getDataUri(temp);
        let myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
          folder: "products",
        });
        imageLink.push({
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        });
      }
    }

    req.body.images = imageLink;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const category = req.query.category;
    const priceGte = req.query?.price?.gte ? Number(req.query.price.gte) : 0;
    const priceLte = req.query?.price?.lte
      ? Number(req.query.price.lte)
      : 250000;
    const searchTerm = req.query.keyword;
    const sort = req?.query?.sort ? Number(req?.query?.sort) : undefined;
    const ratingGte = req.query?.ratings?.gte
      ? Number(req?.query?.ratings?.gte)
      : 0;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * 8;

    const pipeline = [
      {
        $match: {
          $and: [{ price: { $gte: priceGte } }, { price: { $lte: priceLte } }],
        },
      },
      {
        $match: {
          ratings: { $gte: ratingGte },
        },
      },
    ];
    if (searchTerm) {
      pipeline.push({
        $match: searchTerm
          ? { name: { $regex: searchTerm, $options: "i" } }
          : {},
      });
    }
    if (sort) {
      pipeline.push({
        $sort: {
          price: Number(sort),
        },
      });
    }
    if (category) {
      pipeline.push({
        $match: category ? { category: { $eq: category } } : {},
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        documents: { $push: "$$ROOT" },
      },
    });
    pipeline.push({
      $project: {
        _id: 0,
        totalCount: 1,
        documents: {
          $slice: ["$documents", skip, 8], // skip and limit
        },
      },
    });

    const products = await Product.aggregate([...pipeline]);

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

//get Single product
const getSingleProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("No Product Found", 400));
    const relatedProducts = await Product.aggregate([
      {
        $match: { category: product.category },
      },
      {
        $limit: 8,
      },
    ]);

    res.status(200).json({ success: true, product, relatedProducts });
  } catch (error) {
    next(error);
  }
};

//update Products --admin
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("No Product Found", 400));

    if (req.files.length !== 0) {
      for (let temp of product.images) {
        await cloudinary.v2.uploader.destroy(temp.public_id);
      }

      const imageLink = [];

      for (let temp of req.files) {
        const imageUri = getDataUri(temp);
        const myCloud = await cloudinary.v2.uploader.upload(imageUri.content, {
          folder: "products",
        });

        imageLink.push({
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        });
      }

      req.body.images = imageLink;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Updated Successfully", product });
  } catch (error) {
    next(error);
  }
};

//Delete
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("No Product Found", 400));

    for (let temp of product.images) {
      await cloudinary.v2.uploader.destroy(temp.public_id);
    }
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: "successfully Deleted" });
  } catch (error) {
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const cat = await Product.aggregate([
      { $group: { _id: "$category", name: { $push: "$name" } } },
    ]);
    res.status(200).json({ success: true, products, cat });
  } catch (error) {
    next(error);
  }
};

const featuredProduct = async (req, res, next) => {
  try {
    const featuredProducts = await Product.find({}).limit(6);
    const popularProducts = await Product.find({})
      .sort({ ratings: -1 })
      .limit(6);
    const newProducts = await Product.find({}).sort({ createdat: -1 }).limit(8);

    res
      .status(200)
      .json({ success: true, featuredProducts, popularProducts, newProducts });
  } catch (error) {
    next(error);
  }
};

//forgot Password

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAdminProducts,
  featuredProduct,
};
