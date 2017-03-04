
var request = require('request');
var fs = require('fs');
// var bcrypt = require('bcryptjs');

var Digit = {};
/**
 * 四舍五入法截取一个小数
 * @param float digit 要格式化的数字
 * @param integer length 要保留的小数位数
 * @return float
 */
Digit.round = function(digit, length) {
  length = length ? parseInt(length) : 0;
  if (length <= 0) return Math.round(digit);
  digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
  return digit;
};
/**
 * 舍去法截取一个小数
 * @param float digit 要格式化的数字
 * @param integer length 要保留的小数位数
 * @return float
 */
Digit.floor = function(digit, length) {
  length = length ? parseInt(length) : 0;
  if (length <= 0) return Math.floor(digit);
  digit = Math.floor(digit * Math.pow(10, length)) / Math.pow(10, length);
  return digit;
};
/**
 * 进一法截取一个小数
 * @param float digit 要格式化的数字
 * @param integer length 要保留的小数位数
 * @return float
 */
Digit.ceil = function(digit, length) {
  length = length ? parseInt(length) : 0;
  if (length <= 0) return Math.ceil(digit);
  digit = Math.ceil(digit * Math.pow(10, length)) / Math.pow(10, length);
  return digit;
};

exports.getDate = function(date, format) {

  format = format || 'yyyy-mm-dd hh:mm:ss';
  var today = date ? new Date(date) : new Date();

  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;

  switch (true) {
    case format === 'yyyymmdd':
      return yyyy+''+mm+''+dd;
    case format === 'yyyy-mm-dd hh:mm:ss':
      return yyyy+'-'+mm+'-'+dd+' '+h+':'+m+':'+s;
  }

};

// 获取日期的格式
exports.formatDate = function (date) {
  var today = date ? new Date(date) : new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return yyyy+'-'+mm+'-'+dd+' '+h+':'+m+':'+s;
};

exports.formatDateTime = function(date) {
  var today = date ? new Date(date) : new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return yyyy+'-'+mm+'-'+dd+' '+h+':'+m+':'+s;
};

// 2个日期之间天数的差异
exports.dateDiffNumberOfDays = function (dateA, dateB) {
  var diff = ( new Date(dateA).getTime() - new Date(dateB).getTime() ) / 86400000;
  return Digit.floor(diff);
};

// 2个日期之间的小时差异
exports.dateDiffNumberOfHour = function (dateA, dateB) {
  var diff = ( new Date(dateA).getTime() - new Date(dateB).getTime() ) / (1000*60*60);
  return diff;
};

// 2个日期之间的分钟差异
exports.dateDiffNumberOfMinute = function (dateA, dateB) {
  var diff = ( new Date(dateA).getTime() - new Date(dateB).getTime() ) / (1000*60);
  return Digit.ceil(diff);
};

// 秒钟时间格式转换
exports.secondsTransformToCumulativeTime = function (seconds) {
  if (seconds === 0) return '0 分钟';
  var minutes = parseInt(seconds/60);
  var hours = minutes > 60 ? parseInt(minutes/60) : 0;
  minutes = minutes - 60 * hours;
  minutes = minutes > 0 ? minutes : 0;
  var time = hours > 0 ? hours + '小时' : '';
  time += minutes > 0 ? minutes + '分钟' : '';
  return time;
};

// 计算两个日期的间隔时间
exports.diff = function(date1, date2) {

  var start = Math.ceil(new Date(date1).getTime()/1000);
  var end = Math.ceil(new Date(date2).getTime()/1000);

  var timestamp = start - end;

  var time = '';

  switch (true) {
    // 一秒内
    case timestamp < 1:
      time = '刚刚';
      break;
    // 一分钟内
    case timestamp < 60:
      time = parseInt(timestamp/1)+'秒前';
      break;
    // 一小时内
    case timestamp > 60 && timestamp < 3600:
      var t = parseInt(timestamp / 60);
      time = t+'分钟前';
      break;
    // 一天内
    case timestamp >= 3600 && timestamp < 86400:
      var hours = parseInt(timestamp / 3600);
      var minutes = parseInt( (timestamp - (3600 * hours) )/60 );
      time = hours+'小时 '+minutes+'分钟前';
      break;
    // 一年内
    case timestamp >= 86400 && timestamp < 31536000:
      time = Math.floor(timestamp / 86400) +'天前';
      break;
    // 大于一天
    default:
      time = Math.floor(timestamp / 31536000)+'年前';
  }

  return time;
};

exports.download = function(uri, dir, filename, callback) {
  request.head(uri, function(err, res, body){
    var stream = request(uri).pipe(fs.createWriteStream(dir + "/" + filename));
    stream.on('finish', function () {
      callback();
    });
  });
};

exports.getIP = function(req) {
         // form nginx ip
  return req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress;
};
