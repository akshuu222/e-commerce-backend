const ErrorHandler = require("../utils/errorHandler");

const errorMiddleware = async (err, req, res, next) => {

  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    const message = `Resource Not Found Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === "jsonWebTokenError") {
    const message = `Json Web Token Is Invalid ,Try Again`;
    err = new ErrorHandler(message, 400);
  }
  
  if (err.code === "TokenExpiredError") {
    const message = `Json Web Token Is Expired ,Try Again`;
    err = new ErrorHandler(message, 400);
  }


  res.status(err.statusCode).json({ success: false, message: err.message });
};

module.exports = errorMiddleware;
