var Like = require('../schemas').Like;

exports.add = function(info, callback){
  var like = new Like();
  like.user_id = info.user_id;
  like.type = info.type;
  like.target_id = info.target_id;
  like.mood = info.mood;
  like.save(callback);
};

exports.fetch = function(query, select, options, callback) {
  var find = Like.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
};

exports.save = function(data, callback) {
  new Like(data).save(callback);
};

exports.find = function(query, select, options, callback) {
  var find = Like.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
};

exports.findOne = function(query, select, callback) {
  Like.findOne(query, select).exec(callback)
}

exports.update = function(condition, contents, callback) {
  Like.update(condition, contents, callback);
}

exports.count = function(query, callback) {
  Like.count(query, callback);
}

exports.fetchByUserIdAndCommentId = function(userId, targetId, callback) {
  Like.findOne({ user_id: userId, target_id: targetId, type: 'comment' })
  .exec(callback);
};

// 更新删除状态
exports.updateDeleteById = function(id, boolean, callback) {
  Like.update({ _id: id }, { $set: { deleted: boolean }})
  .exec(callback);
};

// 通过用户 id 和 feed id 找寻一条数据
exports.fetchByUserIdAndFeedId = function(userId, feedId, callback) {
  Like.findOne({ user_id: userId, target_id: feedId, type: 'feed' })
  .exec(callback);
};

// 通过用户 id 和 feed ids 数组找寻多条数据
exports.fetchByUserIdAndFeedIds = function(userId, ids, callback) {
  Like.find({ user_id: userId, type: 'feed', target_id: { $in: ids }, deleted: false })
  .exec(callback);
};

// 通过 feed id 获取like的总数
exports.fetchTotalByFeedId = function(feedId, callback) {
  Like.count({ type: 'feed', target_id: feedId, deleted: false })
  .exec(callback);
};

// 通过 comment id 获取like的总数
exports.fetchTotalByCommentId = function(commentId, callback) {
  Like.count({ type: 'comment', target_id: commentId, deleted: false })
  .exec(callback);
};

exports.fetchUserIdAndCommentIds = function(userId, ids, callback) {
  Like.find({ type: 'comment', user_id: userId, target_id: { $in: ids }, deleted: false })
  .select({ target_id: 1, _id: 0 })
  .exec(callback);
};
