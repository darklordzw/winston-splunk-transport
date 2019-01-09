const { Logger } = require("splunk-logging");
const { MESSAGE } = require("triple-beam");
const Transport = require("winston-transport");

/**
 * Tries to parse a string as JSON. If successful, the object is returned.
 * @param {string} jsonString The string to parse.
 * @returns {object} The parsed object, or null.
 */
function tryParseJSON(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    if (obj && typeof obj === "object") {
      return obj;
    }
  } catch (err) {} // eslint-disable-line no-empty
  return null;
}

module.exports = class SplunkTransport extends Transport {
  /**
   *
   * @param {object} opts Transport configuration options.
   * @param {object} opts.splunk Splunk-specific transport options.
   * @param {string} opts.splunk.token The token used for connecting to the Splunk HTTP appender.
   * @param {string} [opts.splunk.source=winston] The value used for the "source" metadata passed to Splunk.
   * @param {string} [opts.splunk.sourcetype=winston-splunk-http-transport] The value used for the "sourcetype" metadata passed to Splunk.
   * @param {integer} [opts.splunk.batchInterval=1000] The number of milliseconds to wait before flushing logs.
   * @param {integer} [opts.splunk.maxBatchCount=10] The number of logs to batch before flushing.
   * @param {integer} [opts.splunk.maxBatchSize=1024] The size of the batch, in bytes, to accumulate before flushing.
   * @param {integer} [opts.splunk.maxRetries=10] The number of times the transport should retry sending failed batches.
   * @param {string} [opts.splunk.url=https://localhost:8088] The url used to connect to the Splunk appender.
   * @param {string} [opts.splunk.index] The Splunk index to log to. Logs to the default index for the token if not specified.
   */
  constructor(opts) {
    super(opts);

    if (!opts || !opts.splunk || !opts.splunk.token) {
      throw new Error("Invalid Configuration: opts.splunk is invalid");
    }

    // "source" and "sourcetype" are used to set the corresponding splunk log metadata.
    this.source = opts.splunk.source || "winston";
    this.sourcetype = opts.splunk.sourcetype || "winston-splunk-http-transport";
    this.index = opts.splunk.index;

    // Configure splunk defaults.
    const splunkOptions = {
      batchInterval:
        typeof opts.splunk.batchInterval === "undefined"
          ? 1000
          : opts.splunk.batchInterval,
      maxBatchCount:
        typeof opts.splunk.maxBatchCount === "undefined"
          ? 10
          : opts.splunk.maxBatchCount,
      maxBatchSize:
        typeof opts.splunk.maxBatchSize === "undefined"
          ? 1024
          : opts.splunk.maxBatchSize,
      maxRetries:
        typeof opts.splunk.maxRetries === "undefined"
          ? 10
          : opts.splunk.maxRetries,
      level: opts.level || "info",
      token: opts.splunk.token,
      url: opts.splunk.url || "https://localhost:8088"
    };

    this.logger = new Logger(splunkOptions);

    // We want winston to format our log messages, just pass them through directly.
    this.logger.eventFormatter = message => message;
    this.logger.error = () => {};
  }

  get splunkConfig() {
    return this.logger.config;
  }

  /**
   * Called to log a message to splunk.
   * @param {object} info The info to log.
   * @param {*} [callback] Optional function to call when the log action is complete.
   */
  log(info, callback) {
    const payload = {
      message: tryParseJSON(info[MESSAGE]) || info[MESSAGE],
      metadata: {
        source: this.source,
        sourcetype: this.sourcetype,
        index: this.index
      },
      severity: info.level
    };

    this.logger.send(payload, err => {
      if (err) {
        this.emit("warn", err);
      } else {
        this.emit("logged", info);
      }
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Called when the transport shout close.
   * @param {function} [callback] Optional function to call when the transport is closed.
   */
  close(callback) {
    // Set the batchInterval to 0 to stop the background batching loop.
    this.logger.config.batchInterval = 0;

    // Flush any remaining events.
    this.logger.flush(() => {
      if (callback) {
        callback();
      }
    });
  }
};
