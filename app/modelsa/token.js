
var Token = require('../schemas').Token;

exports.fetch = function(query, select, options, callback) {
  var find = Token.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
};

exports.save = function(data, callback) {
  new Token(data).save(callback);
};

exports.find = function(query, select, options, callback) {
  var find = Token.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
};
/*
exports.findOne = function(query, select, callback) {
  Token.findOne(query, select).exec(callback)
}
*/
exports.findOne = function(query, select, options, callback) {
  var find = Token.findOne(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
};

exports.update = function(condition, contents, callback) {
  Token.update(condition, contents, callback);
}

exports.remove = function(conditions, callback) {
  Token.remove(conditions, callback);
}
