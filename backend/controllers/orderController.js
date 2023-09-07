const Order = require("../models/ordermodels");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");

const newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const order = await Order.create({
      shippingInfo: shippingInfo,
      orderItems: orderItems,
      paymentInfo: paymentInfo,
      itemsPrice: itemsPrice,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    res
      .status(201)
      .json({ success: true, order, message: "order placed successfully" });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order)
      return next(new ErrorHandler(`No Order Found This Id ${req.params.id}`));
    res.status(200).json({ success: true, order });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email");

    const groupByCountry = await Order.aggregate([
      {
        $group: {
          _id: "$shippingInfo.country",
          count: { $sum: 1 },
        },
      },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const noOfOrdersByDate = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const totalAmount = orders.reduce((acc, crr) => acc + crr.totalPrice, 0);
    res
      .status(200)
      .json({
        success: true,
        orders,
        totalAmount,
        noOfOrdersByDate,
        groupByCountry,
      });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    console.log("body is", req.body);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400)
      );
    }

    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Order Updated",
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
    await Order.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
};

module.exports = {
  newOrder,
  getSingleOrder,
  myOrders,
  updateOrderStatus,
  deleteOrder,
  getAllOrders,
};
