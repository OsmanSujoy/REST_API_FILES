const logger = require("pino");
const dayjs = require("dayjs");
// logger to beautify the server logs
// also add timesteamp for later analysis
module.exports = logger({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`, 
});
