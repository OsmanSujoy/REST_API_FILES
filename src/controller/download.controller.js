const {
  checkPublicKeyExists,
  dailyDwonloadLimitCheck,
  updateDailyDownloadUsages,
} = require("../service/download.service");
const log = require("../utils/logger");
const downloadGoogleService = require("../service/googleDownload.service");

// download the file using provided valid public key
const downloadFiles = async (req, res) => {
  // access the IP from the request
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // get the provided public key 
  const publicKey = req.params.publicKey;
  log.info(
    `Download API: Public Key: ${publicKey} & Storage: ${process.env.PROVIDER}.`
  );
  //check whether the key is valid
  const fileInfo = await checkPublicKeyExists(publicKey);

  if (fileInfo) {
    // if valid key then check the usages limit
    const limitCheck = await dailyDwonloadLimitCheck(ip, fileInfo.size);
    if (!limitCheck) {
      // upadte the daily usages 
      await updateDailyDownloadUsages(ip, fileInfo.size);
      if (process.env.PROVIDER === "local") {
        // download the file from the local storage
        res.download(process.env.FOLDER + fileInfo.filename, (err) => {
          if (err) {
            log.error(
              `Download API: Status: 500 & File can not be downloaded.`
            );
            // if error
            res.status(500).send({
              message: "File can not be downloaded.",
            });
          }
        });
      } else if (process.env.PROVIDER === "google") {
        // if the storage is google, then download it from the bucket
        await downloadGoogleService(req, res, fileInfo.filename);
      }
    } else {
      // if usages limit exceeded 
      log.warn(`Download API: Status: 500 & Daily download limit exceeded.`);
      res.status(500).send({
        message: `Daily download limit exceeded.`,
      });
    }
  } else {
    //if file is not found
    log.warn(`Download API: Status: 404 & Files not found.`);
    res.status(404).send({
      message: "Files not found.",
    });
  }
};

module.exports = { downloadFiles };
