function generateTimestampUrl() {
  var timestamp = new Date().getTime();
  var url = timestamp.toString(36)
  return url;
}

module.exports = generateTimestampUrl;
