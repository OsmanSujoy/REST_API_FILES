const upload = require("../middleware/fileUpload");

const googleUpload = require("../middleware/googleUpload");
const {
  generateKey,
  dailyUploadLimitCheck,
  updateDailyUploadUsages,
} = require("../service/upload.service");
const log = require("../utils/logger");
const uploadGoogleService = require("../service/googleUpload.service");

// upload the provided file to the defined storage
const uploadFile = async (req, res) => {
  try {
    // access the ip from the request
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    log.info(`Upload API: Storage: ${process.env.PROVIDER}.`);
    // check usage limit
    const limit = await dailyUploadLimitCheck(ip);
    if (!limit) {
      // if local then try to upload the file
      if (process.env.PROVIDER === "local") {
        await upload(req, res);
        // if no file is provided in the request
        if (req.file == undefined) {
          log.warn(`Upload API: Status: 400 & Choose a file to upload.`);
          return res.status(400).send({ message: "Choose a file to upload" });
        }
        // after successfull uploading, generate and return public & private keys
        const result = await generateKey(req.file, ip);
        // update the daily usages
        await updateDailyUploadUsages(ip, result.size);
        log.info(
          `Upload API: Status: 200 & Public key ${result.publicKey} | Private key ${result.privateKey}.`
        );
        res.status(200).send({
          publicKey: result.publicKey,
          privateKey: result.privateKey,
        });
      } else if (process.env.PROVIDER === "google") {
        // if storage is google them upload it to google bucket
        await googleUpload(req, res);
        // if no file provided then return message to select a file
        if (req.file == undefined) {
          log.warn(`Upload API: Status: 400 & Choose a file to upload.`);
          return res.status(400).send({ message: "Choose a file to upload" });
        }
        // after successfull uploading update the usasges
        await uploadGoogleService(req, res);
      }
    } else {
      // if the usages limit exceeded
      log.warn(`Upload API: Status: 500 & Daily upload limit exceeded.`);
      res.status(500).send({
        message: `Daily upload limit exceeded`,
      });
    }
  } catch (err) {
    // if file is exceeding the defined limit
    if (err.code == "LIMIT_FILE_SIZE") {
      log.warn(
        `Upload API: Status: 500 & File size should be less than ${process.env.UPLOAD_LIMIT}.`
      );
      return res.status(500).send({
        message: `File size should be less than ${process.env.UPLOAD_LIMIT}`,
      });
    }
    // if any other error occurs during uploading
    log.error(`Upload API: Status: 500 & ${err.message}.`);
    res.status(500).send({
      message: `Error occured: ${err}`,
    });
  }
};

module.exports = { uploadFile };
