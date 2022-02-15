const { checkPrivateKeyAndDelete } = require("../service/delete.service");
const deleteGoogleService = require("../service/googleDelete.service");
const log = require("../utils/logger");

// controller for detele file using valid private key
const deleteFiles = async (req, res) => {
  // get the provided private key
  const privateKey = req.params.privateKey;
  log.warn(
    `Delete API: Private Key: ${privateKey} & Storage: ${process.env.PROVIDER}.`
  );
  // check whether exists, if yes delete
  const fileInfo = await checkPrivateKeyAndDelete(privateKey);
  if (fileInfo) {
    // if provider is google, then delete it from the defined bucket
    if (process.env.PROVIDER === "google") {
      await deleteGoogleService(req, res, fileInfo.filename);
    }
    log.info(`Delete API: Status: 200 & File name: ${fileInfo.filename}`);
    res.status(200).send({
      message: `${fileInfo.filename} is deleted successfully.`,
    });
  } else {
    //if not valid private key, file will not be deleted
    log.warn(`Delete API: Status: 400 & Files not found.`);
    res.status(404).send({
      message: "Files not found.",
    });
  }
};

module.exports = { deleteFiles };
