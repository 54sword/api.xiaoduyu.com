
var Comment = require('../schemas').Comment;

exports.fetchById = function(id, callback) {
  Comment.findOne({ _id: id })
  .populate([
    {
      path: 'user_id',
      select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'brief': 1, 'feed_count': 1, 'fans': 1 }
    },
    {
      path: 'feed_id'
    }
  ])
  .exec(callback);
};

exports.save = function(info, callback) {

  new Comment(info).save(function(err, comment){

    var opts = [
      { path: 'user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans': 1, 'feed_count': 1, 'follow': 1, 'nodes': 1 } },
      { path: 'reply_id', model: 'Comment', select: { 'user_id': 1, '_id': 0 } }
    ];

    Comment.populate(comment, opts, function(){

      var opts = [
        { path: 'reply_id.user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans': 1, 'feed_count': 1, 'follow': 1, 'nodes': 1 } }
      ];

      Comment.populate(comment, opts, callback);

    });

  });

};

exports.fetch = function(query, select, options, callback) {
  var find = Comment.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.find = function(query, select, options, callback) {
  var find = Comment.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  Comment.findOne(query, select).exec(callback)
}

exports.count = function(data, callback) {
  Comment.count(data).exec(callback);
};

exports.populate = function(collections, options, callback) {
  Comment.populate(collections, options, callback)
}

exports.update = function(condition, contents, callback) {
  Comment.update(condition, contents, callback);
}

/*
Comment.find({}, {}).exec(function(err, posts){
  for (var i = 0, max = posts.length; i < max; i++) {
    Comment.update({ _id: posts[i]._id }, { weaken: false }, function(err){
      if (err) console.log(err);
    })
  }
})
*/
