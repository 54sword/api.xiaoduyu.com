
var User = require('../schemas').User;
// var bcrypt = require('bcryptjs');
var uuid = require('node-uuid');



// 创建账号
exports.create = function(user, callback) {
  var _user = new User();
  _user.nickname = user.nickname;
  _user.create_at = user.createDate;
  _user.last_sign_at = user.createDate;
  if (typeof user.gender != 'undefined') {
    _user.gender = user.gender;
  }
  _user.source = user.source;
  _user.access_token = uuid.v4();
  _user.password = user.password;
  _user.save(callback);
};



exports.fetch = function(query, select, options, callback) {
  var find = User.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.find = function(query, select, options, callback) {
  var find = User.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}


exports.findOne = function(query, select, callback) {
  User.findOne(query, select).exec(callback)
}

/*
var find = User.find({}, {})
find.exec(function(err, result){
  result.map(function(item){
    User.update({ _id: item._id }, { access_token: uuid.v4() }, function(err){
      console.log(item._id)
    })
  })
})
*/

exports.update = function(condition, contents, callback) {
  User.update(condition, contents, callback);
}

exports.getUserCount = function(callback) {
  User.count({}, callback);
};


// 通过id查找一个用户
exports.fetchById = function(id, callback) {
  User.findOne({ _id: id, blocked: false }, {
    __v: 0, access_token: 0, blocked: 0,
    nickname_reset_at: 0, last_sign_at: 0,
    disable_send_reply: 0, role:0, follow_node:0, follow_people: 0
  })
  .exec(callback);
};

// 更新访问的token
exports.updateAccessTokenById = function(id, callback) {

  var access_token = uuid.v4()

  User.update({ _id: id }, { access_token: access_token }, function(err){
    callback(err, access_token)
  })

};

/*
exports.fetchByAccessToken = function(access_token, callback){
  User.findOne({ access_token: access_token },{
    __v: 0, access_token: 0, blocked: 0,
    nickname_reset_at: 0, last_sign_at: 0,
    disable_send_reply: 0, source: 0
  })
  .exec(callback);
};
*/

// 更新最近一次登录的日期
exports.updateLastSignAt = function(userId, callback){
  User.update({ _id: userId }, { $set: { 'last_sign_at': new Date() }})
  .exec(callback);
};

/*
// 重置昵称
exports.resetNickname = function(id, nickname, callback) {
  User.update({_id: id}, { nickname: nickname })
  .exec(function(err){
    if (err) console.log(err);
    User.update({_id: id}, { nickname_reset_at: new Date() })
    .exec(callback);
  });
};
*/

// 重置性别
exports.resetGender = function(id, gender, callback) {
  User.update({_id: id }, { gender: gender })
  .exec(callback);
};

// 重置个人简介
exports.resetBrief = function(id, brief, callback) {
  User.update({_id: id }, { brief: brief })
  .exec(callback);
};

// 更新粉丝累计
exports.updateFansCounnt = function(id, total, callback) {
  User.update({_id: id }, { $set: { fans_count: total } })
  .exec(callback);
};


exports.updateNodeFollowCount = function(id, total, callback) {
  User.update({ _id: id }, { $set: { 'node_follow_count': total } })
  .exec(callback);
};


// question\
exports.addQuestionCount = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'question_count': 1} }).exec(callback);
};
exports.minusQuestionCount = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'question_count': -1} }).exec(callback);
};

// answer
exports.addAnswerCount = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'answer_count': 1} }).exec(callback);
};

exports.minusAnswerCount = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'answer_count': -1} }).exec(callback);
};

// 回复次数 +1
exports.addCommentCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'comment_count': 1} }).exec(callback);
};

// 回复次数 -1
exports.minusCommentCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'comment_count': -1} }).exec(callback);
};

/*
// 分享次数 +1
exports.addFeedTotal = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'feed_total': 1} })
  .exec(callback);
};

// 分享次数 -1
exports.minusFeedTotal = function(id, callback) {
  User.update({ _id: id }, { $inc: { 'feed_total': -1} })
  .exec(callback);
};
*/

// 回复次数 +1
exports.addCommentCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'comment_total': 1} }).exec(callback);
};

// 回复次数 -1
exports.minusCommentCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'comment_total': -1} }).exec(callback);
};

// 赞 +1
exports.addLikeCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'like_count': 1} })
  .exec(callback);
};

// 赞 -1
exports.minusLikeCount = function(id, callback) {
  User.update({_id: id }, { $inc: { 'like_count': -1 } })
  .exec(callback);
};

// 更新like总数量
exports.updateLikeTotal = function(id, total, callback) {
  User.update({ _id: id }, { $set:{ 'like_total': total } })
  .exec(callback);
};

// 更新feed收藏数量
exports.updateFeedCollectTotalById = function(id, total, callback) {
  User.update({ _id: id }, { $set: { 'feed_collect_total': total } })
  .exec(callback);
};

/*
// 更新fans的收藏数量
exports.updateFansTotal = function(id, total, callback) {
  User.update({ _id: id }, { $set: { 'fans_total': total } })
  .exec(callback);
};
*/

exports.updateFollowPeople = function(id, peopleIds, callback) {
  User.update({ _id: id }, { $set: { follow_people: peopleIds, follow_people_count: peopleIds.length } })
  .exec(callback);
};

exports.updateFollowNode = function(id, nodeIds, callback) {
  User.update({ _id: id }, { $set: { follow_node: nodeIds, follow_node_count: nodeIds.length } })
  .exec(callback);
};

/*
exports.updateFollowCount = function(id, total, callback) {
  User.update({ _id: id }, { $set: { 'follow_people_count': total } })
  .exec(callback);
};
*/

// 更新头像状态，ture已经上传了头像，false 未上传
exports.updateAvatarById = function(id, boolean, callback) {
  User.update({ _id: id }, { $set: { 'avatar': boolean } })
  .exec(callback);
};
