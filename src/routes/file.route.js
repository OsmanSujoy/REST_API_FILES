const express = require("express");
const router = express.Router();

const uploadController = require("../controller/upload.controller");
const downloadController = require("../controller/download.controller");
const deleteController = require("../controller/delete.controller");

// individual endpoint for the APIs
let routes = (app) => {
  // uploading endpoint
  router.post("/files", uploadController.uploadFile);
  // downloading endpoint
  router.get("/files/:publicKey", downloadController.downloadFiles);
  // deleting endpoint
  router.delete("/files/:privateKey", deleteController.deleteFiles);

  app.use(router);
};

module.exports = routes;
