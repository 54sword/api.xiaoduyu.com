var UserNotification = require('../schemas').UserNotification;

exports.save = function(data, callback) {
  new UserNotification(data).save(callback)
}

exports.create = function(data, callback) {
  UserNotification.create(data, function(err){
    if (callback) callback(err)
  })
}

exports.find = function(query, select, options, callback) {
  var find = UserNotification.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  UserNotification.findOne(query, select).exec(callback)
}

exports.update = function(condition, contents, callback) {
  UserNotification.update(condition, contents, callback);
}

exports.count = function(query, callback) {
  UserNotification.count(query, callback);
}
