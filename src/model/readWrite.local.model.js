const fs = require("fs");
const log = require("../utils/logger");

// function to read local database - in the example, it is the text file
const readData = async (filePath) => {
  const getData = JSON.parse(fs.readFileSync(filePath).toString());
  return getData.data;
};

// function to updating local database - in the example, it is the text file
const writeData = async (filePath, dataArray) => {
  fs.writeFileSync(filePath, JSON.stringify({ data: dataArray }));
};

// function to delete data from local database - in the example, it is the text file
const deleteFile = async (fileName) => {
  try {
    // deleting the file from local storage
    fs.unlinkSync(process.env.FOLDER + fileName);
  } catch (error) {
    log.error(error.message);
  }
};

module.exports = {
  readData,
  writeData,
  deleteFile,
};
