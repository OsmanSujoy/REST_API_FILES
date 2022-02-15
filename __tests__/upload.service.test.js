const { readData, writeData } = require("../src/model/readWrite.local.model");
const {
  generateKey,
  dailyUploadLimitCheck,
  updateDailyUploadUsages,
} = require("../src/service/upload.service");

jest.mock("../src/model/readWrite.local.model", () => ({
  // mocking the below function
  readData: jest.fn(),
  writeData: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
  readData.mockReturnValueOnce([]); // mock function return no data
});

afterEach(() => {
  jest.clearAllMocks(); // clear all the mocks
});

describe("Upload Service Unit Test", () => {
  // teat to generate public & private keys
  describe("Generate public & private key", () => {
    test("should return publicKey & privateKey", async () => {
      generateKey({}).then((data) => {
        // should return public & private key properties if succeeded
        expect(data).toHaveProperty("publicKey");
        expect(data).toHaveProperty("privateKey");
        expect(readData).toHaveBeenCalledTimes(1);
        expect(writeData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Check the daily upload limit", () => {
    // Testing the checking of daily upload limit
    test("should return boolean", async () => {
      dailyUploadLimitCheck("127.0.0.1").then((data) => {
        // should return a defined value
        expect(data).toBeDefined();
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Update the daily upload limit", () => {
    // Testing the updation of daily upload limit
    test("should return boolean", async () => {
      updateDailyUploadUsages("127.0.0.1").then((data) => {
        // should call for updation of usages
        expect(writeData).toHaveBeenCalledTimes(1);
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });
});
