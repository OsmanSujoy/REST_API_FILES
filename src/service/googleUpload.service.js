const { generateKey, updateDailyUploadUsages } = require("./upload.service");
const _ = require("lodash");
require("dotenv").config();
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 16 });
const re = /(?:\.([^.]+))?$/;
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: process.env.CONFIG });
const bucket = storage.bucket(`${process.env.BUCKET}`);
const log = require("../utils/logger");

// update the file in google bucket
const uploadGoogle = async (req, res) => {
  const renameFile = `${uid()}.${re.exec(req.file.originalname)[1]}`;
  const blob = bucket.file(renameFile);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });
  // if error in connection the bucket
  blobStream.on("error", (err) => {
    res.status(500).send({ message: err.message });
  });
  // otherwise upload the file
  blobStream.on("finish", async (data) => {
    // Create URL for directly file access via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    try {
      // Make the file public
      await bucket.file(renameFile).makePublic();
    } catch {
      // if error
      log.error(
        `Upload Service Google: Status: 500 & Uploaded the file successfully: ${req.file.originalname} AS ${renameFile}, but public access is denied!`
      );
      return res.status(500).send({
        message: `Uploaded the file successfully: ${req.file.originalname} AS ${renameFile}, but public access is denied!`,
        url: publicUrl,
      });
    }
    // upload the database with generated file name
    req.file.filename = renameFile;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // generate public & private keys
    const result = await generateKey(_.omit(req.file, ["buffer"]), ip);
    //update the daily usasges
    await updateDailyUploadUsages(ip, result.size);
    log.info(
      `Upload Service Google: Status: 200 & Public key ${result.publicKey} | Private key ${result.privateKey}.`
    );
    res.status(200).send({
      publicKey: result.publicKey,
      privateKey: result.privateKey,
    });
  });
  blobStream.end(req.file.buffer);
};

module.exports = uploadGoogle;
