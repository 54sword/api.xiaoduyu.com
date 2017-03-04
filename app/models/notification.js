var Notification = require('../schemas').Notification;

exports.save = function(data, callback) {
  new Notification(data).save(callback)
}

exports.find = function(query, select, options, callback) {
  var find = Notification.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  Notification.findOne(query, select).exec(callback)
}

exports.update = function(condition, contents, callback) {
  Notification.update(condition, contents, callback);
}

exports.count = function(query, callback) {
  Notification.count(query, callback);
}
