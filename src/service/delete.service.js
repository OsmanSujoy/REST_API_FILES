const {
  readData,
  writeData,
  deleteFile,
} = require("../model/readWrite.local.model");

// function to check the validity of the given private key and delete
const checkPrivateKeyAndDelete = async (privateKey) => {
  const dataArray = await readData(process.env.LOCAL_DATABASE);

  let matchFound;
  // find the matching private key
  const newArray = dataArray.filter((data) => {
    if (data.privateKey !== privateKey) {
      return data;
    } else {
      matchFound = data;
    }
  });
  if (matchFound) {
    // if match found delete the file and update the database
    await writeData(process.env.LOCAL_DATABASE, newArray);
    if (process.env.PROVIDER === "local") {
      // delete the file form local storage
      await deleteFile(matchFound.filename);
    }
  }
  return matchFound;
};

module.exports = {
  checkPrivateKeyAndDelete,
};
