"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.METRICS = undefined;
exports.searchMetric = searchMetric;
exports.nsToDimName = nsToDimName;
exports.toMax = toMax;
exports.toMin = toMin;
exports.toAxisYLabel = toAxisYLabel;
exports.toY = toY;
exports.find_stat_name = find_stat_name;
exports.calc_period = calc_period;
exports.to_axis_x_label_text = to_axis_x_label_text;

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metricsRDS = [{ MetricName: "BinLogDiskUsage", Statistics: ["Maximum"] }, { MetricName: "CPUUtilization", Statistics: ["Average"] }, { MetricName: "DatabaseConnections", Statistics: ["Maximum"] }, { MetricName: "DiskQueueDepth", Statistics: ["Maximum"] }, { MetricName: "FreeStorageSpace", Statistics: ["Minimum"] }, { MetricName: "FreeableMemory", Statistics: ["Minimum"] }, { MetricName: "NetworkReceiveThroughput", Statistics: ["Maximum"] }, { MetricName: "NetworkTransmitThroughput", Statistics: ["Maximum"] }, { MetricName: "ReadIOPS", Statistics: ["Maximum"] }, { MetricName: "ReadLatency", Statistics: ["Maximum"] }, { MetricName: "ReadThroughput", Statistics: ["Maximum"] }, { MetricName: "SwapUsage", Statistics: ["Maximum"] }, { MetricName: "WriteIOPS", Statistics: ["Maximum"] }, { MetricName: "WriteLatency", Statistics: ["Maximum"] }, { MetricName: "WriteThroughput", Statistics: ["Maximum"] }];

var metricsEC2 = [{ MetricName: "CPUCreditUsage", Statistics: ["Maximum"] }, { MetricName: "CPUCreditBalance", Statistics: ["Maximum"] }, { MetricName: "CPUUtilization", Statistics: ["Average"] }, { MetricName: "DiskReadOps", Statistics: ["Maximum"] }, { MetricName: "DiskWriteOps", Statistics: ["Maximum"] }, { MetricName: "DiskReadBytes", Statistics: ["Maximum"] }, { MetricName: "DiskWriteBytes", Statistics: ["Maximum"] }, { MetricName: "NetworkIn", Statistics: ["Maximum"] }, { MetricName: "NetworkOut", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed_Instance", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed_System", Statistics: ["Maximum"] }];

var metricsDynamoDB = [{ MetricName: "ConsumedReadCapacityUnits", Statistics: ["Sum"] }, { MetricName: "ConsumedWriteCapacityUnits", Statistics: ["Sum"] }, { MetricName: "ProvisionedReadCapacityUnits", Statistics: ["Maximum"] }, { MetricName: "ProvisionedWriteCapacityUnits", Statistics: ["Maximum"] }, { MetricName: "ConditionalCheckFailedRequests", Statistics: ["Maximum"] }, { MetricName: "OnlineIndexConsumedWriteCapacity", Statistics: ["Maximum"] }, { MetricName: "OnlineIndexPercentageProgress", Statistics: ["Maximum"] }, { MetricName: "OnlineIndexThrottleEvents", Statistics: ["Maximum"] }, { MetricName: "ReturnedItemCount", Statistics: ["Maximum"] }, { MetricName: "SuccessfulRequestLatency", Statistics: ["Maximum"] }, { MetricName: "SystemErrors", Statistics: ["Maximum"] }, { MetricName: "ThrottledRequests", Statistics: ["Maximum"] }, { MetricName: "UserErrors", Statistics: ["Maximum"] }, { MetricName: "WriteThrottleEvents", Statistics: ["Maximum"] }, { MetricName: "ReadThrottleEvents", Statistics: ["Sum"] }];

"Seconds | Microseconds | Milliseconds | Bytes | Kilobytes | Megabytes | Gigabytes | Terabytes | Bits | Kilobits | Megabits | Gigabits | Terabits | Percent | Count | Bytes/Second | Kilobytes/Second | Megabytes/Second | Gigabytes/Second | Terabytes/Second | Bits/Second | Kilobits/Second | Megabits/Second | Gigabits/Second | Terabits/Second | Count/Second | None";
"Minimum | Maximum | Sum | Average | SampleCount";

var METRICS = exports.METRICS = {
  "AWS/EC2": metricsEC2,
  "AWS/RDS": metricsRDS,
  "AWS/DynamoDB": metricsDynamoDB
};

function searchMetric(ns, metricName) {
  var a = METRICS[ns].filter(function (_ref) {
    var n = _ref.MetricName;
    return n.match(new RegExp(metricName, "i"));
  });
  return a[0];
}

function nsToDimName(ns) {
  return {
    "AWS/RDS": "DBInstanceIdentifier",
    "AWS/EC2": "InstanceId",
    "AWS/DynamoDB": "TableName"
  }[ns];
}

function toMax(metrics) {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 100.0;
  }
  return null;
}

function toMin(metrics) {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 0.0;
  }
  return null;
}

function toAxisYLabel(metrics, bytes) {
  if (metrics.Datapoints[0].Unit === "Bytes" && !bytes) {
    return "Megabytes";
  }
  return metrics.Datapoints[0].Unit;
}

function toY(metric, bytes) {
  var e = metric["Maximum"] || metric["Average"] || metric["Minimum"] || metric["Sum"] || metric["SampleCount"];
  if (metric.Unit === "Bytes" && !bytes) {
    return e / (1024 * 1024); // Megabytes
  }
  return e || 0;
}

var _stats = _immutable2.default.Set(["Maximum", "Average", "Minimum", "Sum", "SampleCount"]);
function find_stat_name(datapoints) {
  if (!(datapoints && datapoints.length > 0)) return null;
  var dp = datapoints[0];
  return _immutable2.default.List(Object.keys(dp)).find(function (e) {
    return _stats.has(e);
  });
}

function calc_period(datapoints) {
  var measurement = arguments.length <= 1 || arguments[1] === undefined ? "minutes" : arguments[1];

  if (!(datapoints && datapoints.length > 1)) return null;

  var _datapoints$sort = datapoints.sort(function (a, b) {
    return a.Timestamp.localeCompare(b.Timestamp);
  });

  var _datapoints$sort2 = _slicedToArray(_datapoints$sort, 2);

  var a = _datapoints$sort2[0];
  var b = _datapoints$sort2[1];

  return (0, _moment2.default)(b.Timestamp).diff((0, _moment2.default)(a.Timestamp), measurement);
}

function to_axis_x_label_text(stats, utc) {
  var et = (0, _moment2.default)(stats.EndTime);
  var diff = (0, _moment2.default)(stats.StartTime).diff(et);
  var tz = utc ? "UTC" : new Date().getTimezoneOffset() / 60 + "h";

  var ago = _moment2.default.duration(diff).humanize();
  var from = (utc ? et.utc() : et).format("YYYY-MM-DD HH:mm");
  return find_stat_name(stats.Datapoints) + " every " + calc_period(stats.Datapoints) + "minutes from " + from + " (tz:" + tz + ") to " + ago + " ago";
}

//
if (require.main === module) {
  console.log(JSON.stringify(METRICS, null, 2));
}