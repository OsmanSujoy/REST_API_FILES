const supertest = require("supertest");
const fs = require("fs");
const createServer = require("../src/utils/app");
const app = createServer();
let publicKey;
let privateKey;
describe("API Integration Test", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PROVIDER = "local"; // Set local as the current storage
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });
  describe(`provide: local storage`, () => {
    // Test file location
    const testFileLocation = `${process.env.TEST_FILE_LOCALTION}`;
    describe("upload file", () => {
      test("should return 200 with publicKey & privateKey.", async () => {
        // Testing upload API
        await supertest(app)
          .post(`/files`)
          .type("form")
          .attach("file", testFileLocation) //Using test file for the API
          .expect(200)
          .then((res) => {
            //Should have public key if it succeed
            expect(res.body).toHaveProperty("publicKey");
            // will use the public key in next test to download
            publicKey = res.body.publicKey;
            //Should have private key if it succeed
            expect(res.body).toHaveProperty("privateKey");
            // will use the private key in next test to delete
            privateKey = res.body.privateKey;
          });
      });

      test("should return 400 for missing file.", async () => {
        // Test if the API is called without any files
        await supertest(app)
          .post(`/files`)
          .type("form")
          .expect(400)
          .then((res) => {
            //Should have a message property
            expect(res.body).toHaveProperty("message");
            //Message property should have this message
            expect(res.body.message).toBe("Choose a file to upload");
          });
      });
    });

    describe("download file", () => {
      // Testing download API
      test("should return 200 with the file.", async () => {
        await supertest(app)
          .get(`/files/${publicKey}`) // using the public key from upload test result
          .type("form")
          .expect(200)
          .then((res) => {
            // It should have a buffer property of the uploaded image
            expect(res.body).toHaveProperty("buffer");
          });
      });
      const notPublicKey = "1234";
      // Test if the API is called without any valid public key
      test("should return 404 with no file found message.", async () => {
        await supertest(app)
          .get(`/files/${notPublicKey}`)
          .type("form")
          .expect(404)
          .then((res) => {
            //Should have a message property
            expect(res.body).toHaveProperty("message");
            //Message property should have this message
            expect(res.body.message).toBe("Files not found.");
          });
      });
    });

    describe("delete file", () => {
      // Testing delete API
      test("should return 200 with message about deleted file.", async () => {
        await supertest(app)
          .delete(`/files/${privateKey}`) // using the private key from upload test result
          .type("form")
          .expect(200)
          .then((res) => {
            //Should have a message property
            expect(res.body).toHaveProperty("message");
            //Message property should have this message
            expect(res.body.message).toContain(`is deleted successfully.`);
          });
      });

      test("should return 404 with message about deleted file.", async () => {
        // Test if the API is called without any valid private key
        await supertest(app)
          .delete(`/files/${privateKey}`)
          .type("form")
          .expect(404)
          .then((res) => {
            // Test if the API is called without any valid private key
            expect(res.body).toHaveProperty("message");
            //Message property should have this message
            expect(res.body.message).toBe("Files not found.");
          });
      });
    });
  });
});
