const express = require("express");
const cors = require("cors");
const routes = require("../routes/file.route");

// function to create an express server
// this will give benefits in testing process
function createServer() {
  const app = express();
  // defined the port, if no port found 8888 will be the default
  const port = process.env.PORT || 8888;
  // cros setup for cross platform
  var corsConfig = {
    origin: `http://localhost:${port}`,
  };

  app.use(cors(corsConfig));
  // enable the urlencode
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  routes(app);
  return app;
}

module.exports = createServer;
