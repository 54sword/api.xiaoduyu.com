
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

/*
exports.add = function(info, callback) {

  var comment = new Comment();

  comment.user_id = info.userId;
  comment.content = info.content;
  comment.ip = info.ip;
  comment.device = info.deviceId;
  comment.answer_id = info.answerId;

  // 回复了某个comment
  if (info.replyId) comment.reply_id = info.replyId;

  comment.save(function(err, comment){

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
*/
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
exports.fetch = function(query, opt, callback) {

  var find = Comment.find(query)
  for (var i in opt) {
    find[i](opt[i])
  }
  find.exec(function(err, comments){

    var opts = [
      {
        path: 'reply_id.user_id',
        model: 'User',
        select: { '_id': 1, create_at:1, avatar_url:1, nickname:1 }
      }
    ];

    Comment.populate(comments, opts, callback);
  })
}
*/



/*
exports.addLikeCount = function(id, callback) {
  Comment.update({ _id: id }, { $inc: { 'like_count': 1 } }).exec(callback);
};

exports.minusLikeCount = function(id, callback) {
  Comment.update({ _id: id }, { $inc: { 'like_count': -1 } }).exec(callback);
};
*/

/*
exports.fetchComments = function(condition, skip, limit, replyLimit, callback) {

  Comment.find(condition)
  .limit(limit)
  .skip(skip)
  .populate([
    {
      path: 'user_id',
      select: {
        '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1
      }
    },
    {
      path: 'albums'
    },
    {
      path: 'comments',
      select: {
        '_id': 1, 'albums': 1, 'comments': 1, 'content': 1, 'device': 1, 'create_at': 1,
        'comment_total': 1, 'user_id': 1, 'likes': 1, 'like_total': 1, 'reply_id':1, 'video': 1, 'blocked': 1, 'deleted': 1
      },
      // match: { 'blocked': false, 'deleted': false },
      options: { limit: replyLimit, sort:{ 'last_reply_at': -1, '_id': 1 } }
    },
    {
      path: 'albums',
      select: { _id: 1, md5: 1, type: 1, dimensions: 1 }
    },
    {
      path: 'reply_id',
      select: {
        '_id': 1, 'albums': 1, 'comments': 1, 'content': 1, 'device': 1, 'create_at': 1,
        'comment_total': 1, 'user_id': 1, 'likes': 1, 'like_total': 1, 'reply_id':1, 'video': 1, 'blocked': 1, 'deleted': 1
      }
    }
  ])
  .sort({ 'last_reply_at': -1, '_id': 1 })
  .exec(function(err, comments){

    if (err) console.log(err);

    var opts = [
      { path: 'comments.user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1 } },
      {
        path: 'comments.comments', model: 'Comment', options: { limit: replyLimit, sort:{ '_id': 1 } },
        // match: { 'blocked': false, 'deleted': false },
        select: {
          '_id': 1, 'albums': 1, 'content': 1, 'device': 1, 'create_at': 1,
          'comment_total': 1, 'user_id': 1, 'likes': 1, 'like_total': 1, 'reply_id':1,
          'video': 1, 'blocked': 1, 'deleted': 1
        }
      },
      { path: 'reply_id.user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1 } }
    ];

    Comment.populate(comments, opts, function(){

      var opts = [
        { path: 'comments.comments.user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1 } },
        { path: 'comments.comments.reply_id', model: 'Comment', select: { 'user_id': 1, '_id': 0 } }
      ];

      Comment.populate(comments, opts, function(){

        var opts = [
          { path: 'comments.comments.reply_id.user_id', model: 'User', select: { '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1 } }
        ];

        Comment.populate(comments, opts, callback);

      });

    });

  });

};
*/
/*
exports.fetchByFeedId = function(feedId, callback) {
  Comment.find({ feed_id: feedId, 'parent_id': { '$exists': false }, deleted: false })
  .exec(callback);
};

exports.fetchByParentId = function(parentId, callback) {
  Comment.find({ parent_id: parentId, deleted: false }).exec(callback);
};

exports.updateLikeTotalById = function(id, total, callback) {
  Comment.update({_id: id }, { '$set': { 'like_total': total } })
  .exec(callback);
};
*/
/*
exports.blockById = function(id, callback) {
  Comment.update({ _id: id }, { $set: { 'blocked': true } }, callback);
};

exports.deleteById = function(id, callback) {
  Comment.update({ _id: id }, { $set: { 'deleted': true } }, callback);
};
*/
/*
exports.updateDeleteById = function(id, boolean, callback) {
  Comment.update({ _id: id }, { $set: { 'deleted': boolean } }, callback);
};

exports.updateCommentsById = function(id, comments, callback) {
  Comment.update({ _id: id }, {
    'comments': comments,
    'comment_total': comments.length
  }, callback);
};
*/
/*
exports.addChildren = function(id, childrenId, callback) {
  Comment.update({ _id: id }, { '$addToSet': { 'children': childrenId } }, callback);
};
*/

/*
exports.updateLastReplyDate = function(id, callback) {
  Comment.update({ _id: id }, { 'last_reply_at': new Date().getTime() }, callback);
};

exports.addReplyCount = function(id, callback) {
  Comment.update({ _id: id }, { $inc: { 'reply_count': 1 } }).exec(callback);
};

exports.minusReplyCount = function(id, callback) {
  Comment.update({ _id: id }, { $inc: { 'reply_count': -1 } }).exec(callback);
};
*/
