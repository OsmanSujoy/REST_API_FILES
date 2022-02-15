const ShortUniqueId = require("short-unique-id");
const fs = require("fs");
const dayjs = require("dayjs");
const { readData, writeData } = require("../model/readWrite.local.model");

// generate public & private key after successfull uploading
const generateKey = async (fileInfo, ip) => {
  const uid = new ShortUniqueId({ length: 10 });
  fileInfo.privateKey = uid();
  fileInfo.publicKey = uid();
  fileInfo.ip = ip;
  fileInfo.provider = process.env.PROVIDER;
  // update the database for later operation - IP & FILE information
  const dataArray = await readData(process.env.LOCAL_DATABASE);
  dataArray.push(fileInfo);
  await writeData(process.env.LOCAL_DATABASE, dataArray);

  return fileInfo;
};

// check the daily upload limit
const dailyUploadLimitCheck = async (ipAddress) => {
  const mbToBCoefficient = 1048576;
  // get the iplist
  const ipArray = await readData(process.env.LOCAL_IPSTORAGE);
  const day = dayjs(new Date()).format("YYYY-MM-DD");
  let usedStorage;
  // check the ip
  ipArray.forEach((ip) => {
    if (ip.ip === ipAddress && ip.day === day) {
      usedStorage = ip.uploadStorage;
    }
  });
  // if found the ip, check the limit
  if (usedStorage) {
    if (
      process.env.UPLOAD_LIMIT * mbToBCoefficient + usedStorage >=
      parseInt(process.env.DAILY_UPLOAD_LIMIT) * mbToBCoefficient
    ) {
      return true;
    }
  }
  return false;
};

// function to update the daily upload usages
const updateDailyUploadUsages = async (ipAddress, fileSize) => {
  // get the ip list
  const ipArray = await readData(process.env.LOCAL_IPSTORAGE);
  const day = dayjs(new Date()).format("YYYY-MM-DD");
  let newIpOrDay = true;
  // check if the ip exists
  ipArray.forEach((ip) => {
    if (ip.ip === ipAddress) {
      if (ip.day === day) {
        // if same date, update the limit
        ip.uploadStorage = parseInt(ip.uploadStorage) + parseInt(fileSize);
        ip.time = dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss");
      } else {
        // otherwise update the limit as well as date
        ip.uploadStorage = parseInt(fileSize);
        ip.day = day;
        ip.time = dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss");
      }
      newIpOrDay = false;
    }
  });
  // if new ip, insert
  if (newIpOrDay) {
    ipArray.push({
      ip: ipAddress,
      day: day,
      uploadStorage: fileSize,
      downloadStorage: 0,
      time: dayjs(new Date()).format("YYYY-MM-DD hh:mm:ss"),
    });
  }
  await writeData(process.env.LOCAL_IPSTORAGE, ipArray);
};

module.exports = {
  generateKey,
  dailyUploadLimitCheck,
  updateDailyUploadUsages,
};
