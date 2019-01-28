
var Topic = require('../schemas').Topic;

// 创建账号
exports.add = function(node, callback) {

  new Topic(node).save(callback);

  /*
  var _node = new Topics();

  if (node.parent_id) {
    _node.parent_id = node.parent_id;
  }

  _node.name = node.name;
  _node.brief = node.brief;
  _node.avatar = node.avatar;
  _node.description = node.description;
  _node.user_id = node.user_id;
  _node.save(callback);
  */
}

exports.update = function(condition, contents, callback) {
  Topic.update(condition, contents, callback);
}

exports.fetch = function(query, select, options, callback) {
  var find = Topic.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

/*
exports.fetchById = function(id, callback) {
  Topics.findOne({ _id: id })
  .populate([
    { path: 'parent_id', select: { _id: 1, name: 1 } },
    { path: 'children', select: { _id: 1, name: 1 } }
  ])
  .exec(callback);
};

*/
exports.updateChildren = function(id, callback) {

  var find = Topics.find({ parent_id: id }, { _id: 1 })

  find.exec(function(err, result){
    if (err) console.log(err)
    var ids = []
    result.map(function(node){
      ids.push(node._id)
    })
    Topics.update({ _id: id }, { children: ids })
    .exec(function(err, result){
      if (callback) callback(err, result)
    });
  })

}

// question

exports.addTopicsQuestionCount = function(id, callback) {
  Topic.update({ _id: id }, { $inc: { 'question_count': 1 } })
  .exec(callback);
};

exports.minusTopicsQuestionCount = function(id, callback) {
  Topic.update({ _id: id }, { $inc: { 'question_count': -1 } })
  .exec(callback);
};

// answer

exports.addAnswerCount = function(id, callback) {
  Topic.update({ _id: id }, { $inc: { 'answer_count': 1 } })
  .exec(callback);
};

exports.minusAnswerCount = function(id, callback) {
  Topic.update({ _id: id }, { $inc: { 'answer_count': -1 } })
  .exec(callback);
};

// 更新收藏总数
exports.updateFollowCount = function(id, total, callback) {
  Topic.update({ _id: id }, { $set: { 'follow_count': total } })
  .exec(callback);
};

/*
exports.fetchAll = function(callback) {
  Topics.find({ parent_id: { $exists : false } })
  .populate([
    { path: 'children', select: {} }
  ])
  .exec(function(err, nodes){
    if (err) console.log(err);
    callback(nodes);
  });
};
*/
