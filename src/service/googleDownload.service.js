require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: process.env.CONFIG });
const bucket = storage.bucket(`${process.env.BUCKET}`);
const log = require("../utils/logger");

// download the file from the google storage
const downloadGoogle = async (req, res, filename) => {
  try {
    const [metaData] = await bucket.file(filename).getMetadata();
    // return the public URL of the file
    return res.redirect(metaData.mediaLink);
  } catch (err) {
    // if error
    log.error(`Download Service Google: Status: 500 & ${err.message}`);
    return res.status(500).send({
      message: "File can not be downloaded.",
    });
  }
};

module.exports = downloadGoogle;
