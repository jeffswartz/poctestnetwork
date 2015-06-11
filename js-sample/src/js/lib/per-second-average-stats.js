var sum = require('lodash.sum'),
    pluck = require('lodash.pluck');

module.exports = function(statsBuffer, seconds) {
  var stats = {};
  ['video', 'audio'].forEach(function(type) {
    stats[type] = {
      packetsPerSecond: sum(pluck(statsBuffer, type), 'packetsReceived') / seconds,
      bytesPerSecond: sum(pluck(statsBuffer, type), 'bytesReceived') / seconds,
      packetsLostPerSecond: sum(pluck(statsBuffer, type), 'packetsLost') / seconds
    };
    stats[type].packetLossRatioPerSecond = stats[type].packetsLostPerSecond / stats[type].packetsPerSecond;
  });
  stats.windowSize = seconds;
  return stats;
};