const util = require("util");
const multer = require("multer");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 16 });
const re = /(?:\.([^.]+))?$/;

// using multer to upload the file in local storage
let storage = multer.diskStorage({
  // storage folder defining
  destination: (req, file, cb) => {
    cb(null, process.env.FOLDER);
  },
  // rename file as unique name for later detection
  filename: (req, file, cb) => {
    // const fileName = file.originalname.toLowerCase().split(" ").join("-");
    const fileName = `${uid()}.${re.exec(file.originalname)[1]}`;
    cb(null, fileName);
  },
});

// uploading the file
let upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * parseInt(process.env.UPLOAD_LIMIT),
  },
}).single("file");

let fileUploadMiddleware = util.promisify(upload);

module.exports = fileUploadMiddleware;
