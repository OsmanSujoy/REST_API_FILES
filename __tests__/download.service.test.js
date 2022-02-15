const { readData, writeData } = require("../src/model/readWrite.local.model");
const {
  dailyDwonloadLimitCheck,
  checkPublicKeyExists,
  updateDailyDownloadUsages,
} = require("../src/service/download.service");

jest.mock("../src/model/readWrite.local.model", () => ({
  // mocking the below function
  readData: jest.fn(),
  writeData: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
});

afterEach(() => {
  jest.clearAllMocks(); // clear all the mocks
});

describe("Download Service Unit Test", () => {
  // Testing download API
  describe("Check the given public key", () => {
    // Test public key cross matching
    test("should return publicKey", async () => {
      // mocking with predefined public key
      readData.mockReturnValueOnce([{ publicKey: "myPublicKey" }]);
      checkPublicKeyExists("myPublicKey").then((data) => {
        // should return the given public key
        expect(data.publicKey).toMatch("myPublicKey");
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe("Check the given non existential public key", () => {
    // Test public key is not valid
    test("should return undefined", async () => {
       // mocking with predefined public key
      readData.mockReturnValueOnce([{ publicKey: "noPublicKey" }]);
      checkPublicKeyExists("yesPublicKey").then((data) => {
        // should not found the given key
        expect(data).toBeUndefined();
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Check the daily download limit", () => {
    // Testing the checking of daily download limit
    test("should return boolean", async () => {
      // mocking with no IP - the limit is not exceeded 
      readData.mockReturnValue([]);
      dailyDwonloadLimitCheck("127.0.0.1").then((data) => {
        // should return a defined value
        expect(data).toBeDefined();
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Update the daily download limit", () => {
    // Testing the updation of daily download limit
    test("should return boolean", async () => {
      readData.mockReturnValue([]);
      updateDailyDownloadUsages("127.0.0.1").then((data) => {
        // should call for updation of usages
        expect(writeData).toHaveBeenCalledTimes(1);
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });
});
