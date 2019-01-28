var Follow = require('../schemas').Follow;

// 添加收藏记录
exports.save = function(data, callback) {
  new Follow(data).save(callback);
};

exports.fetch = function(query, select, options, callback) {
  var find = Follow.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.find = function(query, select, options, callback) {
  var find = Follow.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  Follow.findOne(query, select).exec(callback)
}

exports.update = function(condition, contents, callback) {
  Follow.update(condition, contents, callback);
}

// 获取某个Node的关注总数
exports.count = function(data, callback) {
  Follow.count(data).exec(callback);
};

exports.updateDeleteById = function(id, boolean, callback) {
  Follow.update({ _id: id }, { $set: { deleted: boolean } })
  .exec(callback);
};

// 根据user id ＋ node id 查询一个收藏记录
exports.fetchByUserIdAndNodeId = function(userId, nodeId, callback) {
  Follow.findOne({ user_id: userId, node_id: nodeId })
  .exec(callback);
};

// 获取用户所有关注
exports.fetchAllByUserId = function(userId, callback) {
  Follow.find({ user_id: userId, deleted: false }, { node_id: 1, _id: 0 })
  .populate('node_id', { 'name': 1 })
  .exec(callback);
};

// 获取某个用户的关注总数
exports.fetchTotalByUserId = function(userId, callback) {
  Follow.count({ user_id: userId, deleted: false })
  .exec(callback);
};



exports.fetchByUserId = function(userId, page, perPage, callback) {
  Follow.find({ user_id: userId, deleted: false }, { node_id:1, _id: 1 })
  .skip(page*perPage)
  .limit(perPage)
  .populate('node_id')
  .exec(callback);
};
