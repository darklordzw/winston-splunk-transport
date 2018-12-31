const chai = require("chai");
const winston = require("winston");
const SplunkTransport = require("../index");

const { assert } = chai;
const should = chai.should(); // eslint-disable-line no-unused-vars

describe("SplunkTransport", () => {
  // Just using a random guid for testing.
  const token = "2042f3db-823f-4263-811e-fbf33349b3ee";

  describe("#constructor()", () => {
    let transport;

    afterEach(done => {
      if (transport) {
        transport.close(done);
      }
    });

    it("should set defaults for unspecified options", () => {
      transport = new SplunkTransport({
        splunk: { token }
      });
      transport.source.should.equal("winston");
      transport.sourcetype.should.equal("winston-splunk-http-transport");
      transport.splunkConfig.token.should.equal(token);
      transport.splunkConfig.batchInterval.should.equal(1000);
      transport.splunkConfig.maxBatchCount.should.equal(10);
      transport.splunkConfig.maxBatchSize.should.equal(1024);
      transport.splunkConfig.maxRetries.should.equal(10);
      transport.splunkConfig.protocol.should.equal("https");
      transport.splunkConfig.host.should.equal("localhost");
      transport.splunkConfig.port.should.equal(8088);
    });

    it("should set options to the specified values", () => {
      transport = new SplunkTransport({
        splunk: {
          token,
          source: "test-source",
          sourcetype: "test-source-type",
          batchInterval: 5000,
          maxBatchCount: 100,
          maxBatchSize: 2048,
          maxRetries: 0,
          url: "http://wshtest-test.com:9090"
        }
      });
      transport.source.should.equal("test-source");
      transport.sourcetype.should.equal("test-source-type");
      transport.splunkConfig.token.should.equal(token);
      transport.splunkConfig.batchInterval.should.equal(5000);
      transport.splunkConfig.maxBatchCount.should.equal(100);
      transport.splunkConfig.maxBatchSize.should.equal(2048);
      transport.splunkConfig.maxRetries.should.equal(0);
      transport.splunkConfig.protocol.should.equal("http");
      transport.splunkConfig.host.should.equal("wshtest-test.com");
      transport.splunkConfig.port.should.equal(9090);
    });
  });

  describe("#log()", () => {
    let logger;
    let transport;

    before(() => {
      // Define a custom format.
      const errorStackFormat = winston.format(info => {
        if (info instanceof Error) {
          return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
          });
        }
        return info;
      });

      // Initialize the logger.
      transport = new SplunkTransport({
        splunk: { token: "2042f3db-823f-4263-811e-fbf33349b3ee" }
      });
      logger = winston.createLogger({
        level: "info",
        defaultMeta: { service: "user-service" },
        transports: [transport],
        format: winston.format.combine(
          errorStackFormat(),
          winston.format.json()
        )
      });
    });

    after(() => {
      if (logger) {
        logger.close();
      }
    });

    it("should allow the use of a custom formatter", done => {
      // Mock the send.
      transport.logger.send = payload => {
        try {
          payload.message.level.should.equal("error");
          payload.message.message.should.equal("test");
          assert(payload.message.stack.startsWith("Error: test"));
          done();
        } catch (err) {
          done(err);
        }
      };

      logger.error(new Error("test"));
    });
  });
});
