
var Posts = require('../schemas').Posts;

exports.add = function(info, callback) {

  new Posts(info).save(function(err, feed){

    if (err) console.log(err);

    var opts = [
      {
        path: 'user_id',
        select: {
          '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1
        }
      },
      {
        path: 'topic_id'
      }
    ];

    Posts.populate(feed, opts, callback);

  });
};

/*
exports.fetchById = function(id, callback) {
  Posts.findOne({ _id: id })
  .populate([
    {
      path: 'user_id',
      select: {
        '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1
      }
    },
    {
      path: 'ansers'
    },
    {
      path: 'node_id'
    }
  ])
  .exec(callback);
};


exports.fetch = function(query, select, options, callback) {
  var find = Posts.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}
*/

exports.find = function(query, select, options, callback) {
  var find = Posts.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.populate = function(questions, opts, callback) {
  Posts.populate(questions, opts, callback);
}

exports.update = function(condition, contents, callback) {
  Posts.update(condition, contents, callback);
}

/*
exports.addFollowCount = function(id, callback) {
  Posts.update({ _id: id }, { $inc: { 'follow_count': 1 } })
  .exec(callback);
}

exports.minusFollowCount = function(id, callback) {
  Posts.update({ _id: id }, { $inc: { 'follow_count': -1 } })
  .exec(callback);
}

exports.addViewCount = function(id, callback) {
  Posts.update({ _id: id }, { $inc: { 'view_count': 1 } })
  .exec(callback);
}

exports.addAnswer = function(id, answerId, callback) {
  Posts.update({ _id: id }, { '$addToSet': { answers: answerId }, 'sort_by_date': new Date() }, function(err){
    callback(err);
  });
};

exports.addAnswerCount = function(id, callback) {
  Posts.update({ _id: id }, { $inc: { 'answers_count': 1 } })
  .exec(callback);
}
*/
