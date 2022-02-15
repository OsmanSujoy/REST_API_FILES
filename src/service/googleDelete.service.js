require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: process.env.CONFIG });
const bucket = storage.bucket(`${process.env.BUCKET}`);
const log = require("../utils/logger");

// delete the file from the google nucket
const deleteGoogle = async (req, res, filename) => {
  try {
    await bucket.file(filename).delete();
  } catch (err) {
    // if any error
    log.error(`Delete Service Google: Status: 500 & ${err.message}`);
    res.status(500).send({
      message: "Could not download the file from Google cloud. " + err,
    });
  }
};

module.exports = deleteGoogle;
