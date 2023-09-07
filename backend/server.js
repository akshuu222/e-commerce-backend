const app = require("./app.js");
const cloudinary = require("cloudinary");
const errorMiddleware = require("./middlewares/error.js");
require("dotenv").config()


//DB CONNECT
const connectDB = require("./config/database.js");
connectDB();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server is Connected at Port ${process.env.PORT}`)
);

//Unhandled Promise Rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error ${err.message}`);
  console.log(`The Server Is Shutting Down Due To Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
