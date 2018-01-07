

import { Topic } from '../schemas'
import baseMethod from './base-method'

export default baseMethod(Topic)

/*
var Topic = require('../schemas').Topic;

// 创建账号
exports.add = function(node, callback) {
  new Topic(node).save(callback);
}

exports.update = ({ query = {}, update = {} }) => {
  return Topic.update(query, update)
}


exports.find = ({ query = {}, select = {}, options = {} }) => {
  var find = Topic.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  return find.exec()
}



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
*/
