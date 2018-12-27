const chai = require("chai");
const winston = require("winston");
const SplunkTransport = require("../index");

describe("SplunkTransport", () => {
  let logger;

  before(() => {
    const errorStackFormat = winston.format(info => {
      if (info instanceof Error) {
        return Object.assign({}, info, {
          stack: info.stack,
          message: info.message
        });
      }
      return info;
    });
    logger = winston.createLogger({
      level: "info",
      defaultMeta: { service: "user-service" },
      transports: [
        new SplunkTransport({
          splunk: { token: "2042f3db-823f-4263-811e-fbf33349b3ee" }
        })
      ],
      format: winston.format.combine(errorStackFormat(), winston.format.json())
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
