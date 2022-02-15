const dayjs = require("dayjs");
const { readData, writeData } = require("../model/readWrite.local.model");

// function to check the validity of the given public key
const checkPublicKeyExists = async (publicKey) => {
  // read the local database
  const dataArray = await readData(process.env.LOCAL_DATABASE);

  let matchFound;
  // a match found, return
  dataArray.forEach((data) => {
    if (data.publicKey === publicKey) {
      matchFound = data;
    }
  });
  return matchFound;
};

//function to check the daily download usages
const dailyDwonloadLimitCheck = async (ipAddress, fileSize) => {
  const mbToBCoefficient = 1048576;
  const ipArray = await readData(process.env.LOCAL_IPSTORAGE);
  const day = dayjs(new Date()).format("YYYY-MM-DD");
  let usedStorage;
  // check if the ip exists
  ipArray.forEach((ip) => {
    if (ip.ip === ipAddress && ip.day === day) {
      usedStorage = ip.downloadStorage;
    }
  });
  // if found, check the limit
  if (usedStorage) {
    if (
      usedStorage + fileSize >=
      parseInt(process.env.DAILY_DOWNLOAD_LIMIT) * mbToBCoefficient
    ) {
      return true;
    }
  }
  return false;
};

//functiont to update the daily downlaod usages limit
const updateDailyDownloadUsages = async (ipAddress, fileSize) => {
  const ipArray = await readData(process.env.LOCAL_IPSTORAGE);
  const day = dayjs(new Date()).format("YYYY-MM-DD");
  let newIpOrDay = true;
  // check if the ip exits
  ipArray.forEach((ip) => {
    if (ip.ip === ipAddress) {
      if (ip.day === day) {
        // if same day update the limit
        ip.downloadStorage = parseInt(ip.downloadStorage) + parseInt(fileSize);
        ip.time = dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss");
      } else {
        //other wise udate the limit and date as well
        ip.downloadStorage = parseInt(fileSize);
        ip.day = day;
        ip.time = dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss");
      }
      newIpOrDay = false;
    }
  });
  // if new ip then insert
  if (newIpOrDay) {
    ipArray.push({
      ip: ipAddress,
      day: day,
      uploadStorage: 0,
      downloadStorage: fileSize,
      time: dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss"),
    });
  }
  await writeData(process.env.LOCAL_IPSTORAGE, ipArray);
};

module.exports = {
  dailyDwonloadLimitCheck,
  checkPublicKeyExists,
  updateDailyDownloadUsages,
};
