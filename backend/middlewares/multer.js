const multer = require("multer");

const storage = multer.memoryStorage();
const fileUpload = multer({ storage }).array("file");

module.exports = { fileUpload };
