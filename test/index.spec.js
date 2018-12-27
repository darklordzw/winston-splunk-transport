const chai = require("chai");
const winston = require("winston");
const SplunkTransport = require("../index");

describe("SplunkTransport", () => {
  let logger;

  before(() => {
    logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      defaultMeta: { service: "user-service" },
      transports: [
        new SplunkTransport({
          splunk: { token: "2042f3db-823f-4263-811e-fbf33349b3ee" }
        })
      ]
    });
  });

  after(() => {
    logger.close();
  });

  describe("#log()", () => {
    it("should return -1 when the value is not present", () => {
      logger.error(new Error("test"));
    });
  });
});
