const {
  readData,
  writeData,
  deleteFile,
} = require("../model/readWrite.local.model");

const dayjs = require("dayjs");
const log = require("./logger");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: process.env.CONFIG });
const bucket = storage.bucket(`${process.env.BUCKET}`);

// process to clear data and files of inactive ip 
const clearDataForInactiveIP = async () => {
  log.warn("Inactivity cleaning process started!");
  // get database
  const dataArray = await readData(process.env.LOCAL_DATABASE);
  const ipArray = await readData(process.env.LOCAL_IPSTORAGE);
  // cleaning process
  async function processCleaning() {
    // check each IP
    ipArray.forEach(async (eachIP) => {
      const currentTime = dayjs();
      const lastActiveTime = eachIP.time;
      // check if any ip is inactive based on the prefined inactivity duration
      if (
        currentTime.diff(lastActiveTime, `${process.env.UNIT_TYPE}`) >
        parseInt(process.env.INACTIVITY)
      ) {
        // check all the file of each IP
        dataArray.forEach(async (data, index) => {
          if (data.ip === eachIP.ip) {
            // DELETE operation for local storage
            if (process.env.PROVIDER === "local" && data.provider === "local") {
              await deleteFile(data.filename);
              dataArray.splice(index, 1);
            } else if (
              // Delete operation for google storage
              process.env.PROVIDER === "google" &&
              data.provider === "google"
            ) {
              try {
                // delete the files from google bucket
                await bucket.file(data.filename).delete();
                dataArray.splice(index, 1);
              } catch (err) {
                log.error(err.message);
              }
            }
          }
        });
      }
    });
  }
// after file deletion update the database
  processCleaning().then(async () => {
    await writeData(process.env.LOCAL_DATABASE, dataArray);
    log.info("Inactivity cleaning process completed!");
  });
  // call the cleaning function after every predefined duration
  setTimeout(
    clearDataForInactiveIP,
    parseInt(process.env.CLEAN_UP) * 60 * 60000
  );
};

module.exports = clearDataForInactiveIP;
