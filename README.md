# winston-splunk-http-transport

A simple [winston] transport for logging to [Splunk] via the [HTTP Event Collector].

Log events are sent in batches by default. To disable batching, set the "splunk.batchInterval" config param to 0.

## Installation

```sh
npm install --save winston winston-splunk-http-transport
```

## Usage

```javascript
const winston = require("winston");
const SplunkTransport = require("winston-splunk-http-transport");

// Now use winston as normal
const logger = winston.createLogger({
  transports: [new SplunkTransport({ splunk: { token: "your token" } })]
});

logger.info("Hello world!");
```

## API

### splunkTransport = new SplunkTransport(opts);

Create a new instance of `SplunkTransport`. Takes the following configuration:

- **opts:** Transport configuration options.
- **opts.splunk:** Splunk-specific transport options.
- **opts.splunk.token:** The token used for connecting to the Splunk HTTP appender.
- **[opts.splunk.source=winston]:** The value used for the "source" metadata passed to Splunk.
- **[opts.splunk.sourcetype=winston-splunk-http-transport]:** The value used for the "sourcetype" metadata passed to Splunk.
- **[opts.batchInterval=1000]:** The number of milliseconds to wait before flushing logs.
- **[opts.maxBatchCount=10]:** The number of logs to batch before flushing.
- **[opts.maxBatchSize=1024]:** The size of the batch, in bytes, to accumulate before flushing.
- **[opts.splunk.maxRetries=10]:** The number of times the transport should retry sending failed batches.
- **[opts.splunk.url=https://localhost:8088]:** The url used to connect to the Splunk appender.
- **[opts.splunk.index]:** The Splunk index to log to. Logs to the default index for the token if not specified.

[winston]: https://github.com/winstonjs/winston
[splunk]: http://www.splunk.com
[http event collector]: http://dev.splunk.com/view/event-collector/SP-CAAAE6M
