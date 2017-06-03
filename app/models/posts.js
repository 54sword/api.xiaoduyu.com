
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

exports.find = function(query, select, options, callback) {
  var find = Posts.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  Posts.findOne(query, select).exec(callback)
}

exports.populate = function(questions, opts, callback) {
  Posts.populate(questions, opts, callback);
}

exports.update = function(condition, contents, callback) {
  Posts.update(condition, contents, callback);
}

/*
Posts.find({}, {}).exec(function(err, posts){
  for (var i = 0, max = posts.length; i < max; i++) {
    Posts.update({ _id: posts[i]._id }, { weaken: false }, function(err){
      if (err) console.log(err);
    })
  }
})
*/
