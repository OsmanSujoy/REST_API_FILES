const util = require("util");
const Multer = require("multer");

// using multer preparing the file to upload it in google storage
let uploadFile = Multer({
  storage: Multer.memoryStorage({}),
  limits: {
    fileSize: 1024 * 1024 * parseInt(process.env.UPLOAD_LIMIT),
  },
}).single("file");
let googleFileUploadMiddleware = util.promisify(uploadFile);
module.exports = googleFileUploadMiddleware;
