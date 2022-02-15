const {
  readData,
  writeData,
  deleteFile,
} = require("../src/model/readWrite.local.model");
const { checkPrivateKeyAndDelete } = require("../src/service/delete.service");

jest.mock("../src/model/readWrite.local.model", () => ({
  // mocking the below function
  readData: jest.fn(),
  writeData: jest.fn(),
  deleteFile: jest.fn(),
}));

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
  process.env = { ...OLD_ENV }; // Make a copy
});

afterEach(() => {
  jest.clearAllMocks(); // clear all the mocks
  process.env = OLD_ENV; // Restore old environment
});

describe("Delete Service Unit Test", () => {
  // Testing delete service
  process.env.PROVIDER = "local";
  describe("Check the given private key", () => {
    test("should return privateKey", async () => {
      // Mock function will return predefined private key & file
      readData.mockReturnValueOnce([
        { privateKey: "myPrivateKey", filename: "myFile" },
      ]);
      checkPrivateKeyAndDelete("myPrivateKey").then((data) => {
        // Should return the private key & filename if succeed in deteling the file
        expect(data.privateKey).toMatch("myPrivateKey");
        expect(data.filename).toMatch("myFile");
        expect(readData).toHaveBeenCalledTimes(1);
        expect(writeData).toHaveBeenCalledTimes(1);
        expect(deleteFile).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe("Check the given non existential private key", () => {
    // Test without any valid private key
    test("should return undefined", async () => {
      // mocking with a private key
      readData.mockReturnValueOnce([{ privateKey: "noPrivateKey" }]);
      // testing with another
      checkPrivateKeyAndDelete("yesPrivateKey").then((data) => {
        //should not found the key
        expect(data).toBeUndefined();
        expect(readData).toHaveBeenCalledTimes(1);
      });
    });
  });
});
