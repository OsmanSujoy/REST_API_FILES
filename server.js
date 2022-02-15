const createServer = require("./src/utils/app");
const cleanUpFunction = require("./src/utils/inactivity");
const log = require("./src/utils/logger");
const fs = require("fs");
require("dotenv").config();

// define the port
const port = process.env.PORT || 8888;
cleanUpFunction();
// create express server
const app = createServer();

// if the local storage folder is not exist
if (!fs.existsSync(process.env.FOLDER)) {
  fs.mkdirSync(process.env.FOLDER);
}

// run the server on the given port
app.listen(port, () => {
  log.info(`Connected to port ${port}`);
});

// Handle error
app.use((req, res, next) => {
  setImmediate(() => {
    log.fatal(new Error("New Error!"));
    next(new Error("New Error!"));
  });
});

app.use(function (err, req, res, next) {
  log.fatal(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
