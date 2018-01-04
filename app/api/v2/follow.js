var Topic = require('../../models').Topic;
var Posts = require('../../models').Posts;
var User = require('../../models').User;
var Follow = require('../../models').Follow;
var UserNotification = require('./user-notification');
var async = require('async');

exports.fetch = function(req, res, next) {

  var user = req.user;
  var userId = req.query.user_id;
  var page = req.query.page || 0;
  var perPage = req.query.per_page || 20;
  // 查询某个存在字段
  var field = req.query.field || null;
  var postsId = req.query.posts_id || '';
  var topicsId = req.query.topics_id || '';
  var peopleId = req.query.people_id || '';
  var people_exsits = req.query.people_exsits;
  var posts_exsits = req.query.posts_exsits;

  var query = { deleted: false }
  var select = { __v: 0, create_at: 0, deleted: 0 }
  var options = {}

  // query

  if (typeof people_exsits != 'undefined') {
    query.people_id = { $exists: people_exsits ? true : false }
  }

  if (typeof posts_exsits != 'undefined') {
    query.posts_id = { $exists: posts_exsits ? true : false }
  }

  if (userId) query.user_id = userId
  if (postsId) query.posts_id = postsId
  if (topicsId) query.topics_id = topicsId
  if (peopleId) query.people_id = peopleId

  // option

  if (page > 0) options.skip = page * perPage
  if (perPage > 300) perPage = 300
  options.limit = parseInt(perPage)
  options.sort = { 'create_at': -1 }
  
  options.populate = [
    {
      path: 'user_id',
      // match: { 'deleted': false },
      select: {
        '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'brief': 1, gender: 1,
        fans_count: 1, posts_count: 1, comment_count: 1
      }
    },
    {
      path: 'people_id',
      select: {
        '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'brief': 1, gender: 1,
        fans_count: 1, posts_count: 1, comment_count: 1
      }
    },
    {
      path: 'posts_id',
      match: { 'deleted': false },
      select: {
        '_id': 1, 'content_html': 1, 'create_at': 1, 'comment_count': 1, 'user_id': 1, title: 1
      }
    },
    {
      path: 'topics_id',
      match: { 'deleted': false },
      select: {
        '_id': 1, 'content_html': 1, 'create_at': 1, 'comment_count': 1, 'user_id': 1
      }
    }
  ]

  async.waterfall([
    function(callback) {
      Follow.find(query, select, options, function(err, follows){
        if (err) console.log(err)
        callback(null, follows)
      })
    },
    function(follows, callback) {

      if (!user) {
        callback(null, follows)
        return
      }

      // 如果是登录的状态，那么判断是否关注了该用户

      follows = JSON.stringify(follows);
      follows = JSON.parse(follows);

      var peopleIds = []

      if (follows && follows.length > 0) {

        follows.map(function(item){

          if (item.user_id && peopleIds.indexOf(item.user_id._id) == -1) {
            peopleIds.push(item.user_id._id)
          }

          if (item.people_id && peopleIds.indexOf(item.people_id._id) == -1) {
            peopleIds.push(item.people_id._id)
          }

        })

      }

      Follow.find({
        user_id: user._id,
        people_id: { $in: peopleIds },
        deleted: false
      }, {}, {}, function(err, _follows){
        if (err) console.log(err)

        var ids = {}

        _follows.map(function(item){
          ids[item.people_id] = 1
        })

        follows.map(function(item){
          if (item.user_id) {
            item.user_id.follow = ids[item.user_id._id] ? true : false
          }
          if (item.people_id) {
            item.people_id.follow = ids[item.people_id._id] ? true : false
          }
        })

        callback(null, follows)
      })

    },

    function(follows, callback) {

      if (!user) {
        callback(null, follows)
        return
      }

      var postsIds = []

      follows.map(function(item){
        if (item.posts_id) {
          postsIds.push(item.posts_id)
        }
      })

      if (postsIds.length == 0) {
        callback(null, follows)
      }

      Follow.fetch({
        user_id: user._id,
        posts_id: { "$in": postsIds },
        deleted: false
      }, { posts_id: 1 }, {}, function(err, _follows){

        if (err) console.log(err)
        var ids = {}

        for (var i = 0, max = _follows.length; i < max; i++) {
          ids[_follows[i].posts_id] = 1
        }

        follows.map(function(follow, key){

          if (follow.posts_id) {
            follow.posts_id.follow = ids[follow.posts_id._id] ? true : false
          }

        })

        callback(null, follows)

      })

    }

  ], function(err, result){
    if (err) {
      res.status(404);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true,
        data: result
      });
    }
  })

}

exports.fetchByUserId = function(req, res, next) {

  var user = req.user
  var userId = req.query.user_id;
  var page = req.query.page || 0;
  var perPage = req.query.per_page || 20;

  if (!userId) {
    res.send({
      success: false,
      error: 10005
    })
    return
  }

  Follow.fetchByUserId(userId, page, perPage, function(err, follows){

    if (err) console.log(err)

    var nodes = []

    for (var i = 0, max = follows.length; i < max; i++) {
      nodes.push(follows[i].node_id)
    }

    if (user) {
      nodes = JSON.stringify(nodes);
      nodes = JSON.parse(nodes);
      for (var i = 0, max = nodes.length; i < max; i++) {
        nodes[i].follow = user.follow_node.indexOf(nodes[i]._id) != -1 ? true : false
      }
    }

    res.send({
      success: true,
      data: nodes
    })
  })

}

// 更新用户的关注话题的数量
function updateUserTopicCount(userId, callback) {

  Follow.fetch({
    user_id: userId,
    topic_id: { $exists: true },
    deleted: false
  }, { topic_id: 1, _id: 0 }, {}, function(err, data){
    if (err) {
      console.log(err);
      callback()
      return
    }

    var ids = []
    data.map(function(item){ ids.push(item.topic_id) })

    User.update({ _id: userId }, { follow_topic: ids, follow_topic_count: ids.length }, function(err){
      if (err) console.log(err);
      callback(null);
    });

  })

};

function updateUserPostsCount(userId, callback) {

  Follow.fetch({
    user_id: userId,
    posts_id: { $exists: true },
    deleted: false
  }, { posts_id: 1, _id: 0 }, {}, function(err, data){

    if (err) {
      console.log(err);
      callback()
      return
    }

    var ids = []
    data.map(function(item){ ids.push(item.posts_id) })

    User.update({ _id: userId }, { follow_posts: ids, follow_posts_count: ids.length }, function(err){
      if (err) console.log(err);
      callback(null);
    });

  })

};


function updateUserFollowPeopleCount(userId, callback) {

  Follow.fetch({
    user_id: userId,
    people_id: { $exists: true },
    deleted: false
  }, { people_id: 1, _id: 0 }, {}, function(err, data){

    if (err) {
      console.log(err);
      callback()
      return
    }

    var ids = []
    data.map(function(item){ ids.push(item.people_id) })

    User.update({ _id: userId }, { follow_people: ids, follow_people_count: ids.length }, function(err){
      if (err) console.log(err);
      callback(null);
    });

  })

};



// 更新节点被关注的数量
function updateTopicFollowCount(nodeId, callback) {
  Follow.count({ topic_id: nodeId, deleted: false }, function(err, total){
    if (err) console.log(err);
    Topic.update({ _id: nodeId }, { follow_count: total }, function(err){
      if (err) console.log(err);
      callback(null);
    });
  });
};

function updatePostsFollowCount(postsId, callback) {
  Follow.count({ posts_id: postsId, deleted: false }, function(err, total){
    if (err) console.log(err);
    Posts.update({ _id: postsId }, { follow_count: total }, function(err){
      if (err) console.log(err);
      callback(null);
    });
  });
};

function updatePeopleFollowCount(peopleId, callback) {
  Follow.count({ people_id: peopleId, deleted: false }, function(err, total){
    if (err) console.log(err);

    User.update({ _id: peopleId }, { fans_count:total }, function(err){
      if (err) console.log(err);
      callback(null);
    });
  });
};


// 添加关注
exports.add = function(req, res, next) {

  var user = req.user;
  var topicId = req.body.topic_id;
  var postsId = req.body.posts_id;
  var peopleId = req.body.people_id;

  var topic = null;
  var posts = null;
  var people = null;

  async.waterfall([

    function(callback) {
      if (!topicId && !postsId && !peopleId) {
        callback(14000);
      } else {
        callback(null);
      }
    },

    // 查询话题是否存在
    function(callback) {

      if (!topicId) {
        callback(null)
        return
      }

      Topic.fetch({ _id: topicId }, { _id: 1, parent_id: 1 }, {}, function(err, data){
        if (err) console.log(err);

        if (!data || data.length == 0) {
          callback(15000);
        } else {

          if (!data[0].parent_id) {
            callback(15001);
          } else {
            topic = data[0]
            callback(null);
          }

        }
      });
    },

    // 查询帖子是否存在
    function(callback) {

      if (!postsId) {
        callback(null)
        return
      }

      Posts.find({ _id: postsId }, { user_id:1, _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(11000);
        } else if (data[0].user_id + '' == user._id) {
          callback(15002)
        } else {
          posts = data[0]
          callback(null);
        }
      });
    },

    // 查询用户是否存在
    function(callback) {

      if (!peopleId) {
        callback(null)
        return
      }

      User.fetch({ _id: peopleId }, { _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(13000);
        } else {
          people = data[0]
          callback(null);
        }
      });
    },

    function(callback) {

      var query = { user_id: user._id }

      if (topicId) query.topic_id = topicId
      else if (postsId) query.posts_id = postsId
      else if (peopleId) query.people_id = peopleId

      Follow.fetch(query, {}, {}, function(err, data){
        if (err) console.log(err);
        data = data && data.length > 0 ? data[0] : null
        if (!data) {
          callback(null, null);
        } else if (data.deleted) {
          callback(null, data)
        } else {
          callback(14001);
        }
      })
    },

    // 添加收藏记录
    function(collect, callback) {

      if (!collect) {

        var data = { user_id: user._id }

        if (topicId) data.topic_id = topicId
        else if (postsId) data.posts_id = postsId
        else if (peopleId) data.people_id = peopleId

        // 不存在则添加记录
        Follow.save(data, function(err){
          if (err) {
            console.log(err);
            callback(10002);
          } else {
            callback(null);
          }
        });
      } else {
        // 如果存在那么取消删除的标记
        Follow.update({ _id: collect._id }, { deleted: false }, function(err){
          if (err) {
            console.log(err);
            callback(10003);
          } else {
            callback(null);
          }
        });
      }
    },

    // 发送通知
    function(callback) {

      var notice = null

      if (postsId) {
        notice = {
          type: 'follow-posts',
          posts_id: postsId,
          sender_id: user._id,
          addressee_id: posts.user_id
        }
      } else if (peopleId) {
        notice = {
          type: 'follow-you',
          sender_id: user._id,
          addressee_id: peopleId
        }
      }

      if (notice) {
        UserNotification.add(notice, function(){
          callback(null);
        })
      } else {
        callback(null);
      }

    },

    // 更新用户自己收藏的节点数量
    function(callback) {

      if (topicId) {
        updateUserTopicCount(user._id, function(){
          callback(null);
        });
      } else if (postsId) {
        updateUserPostsCount(user._id, function(){
          callback(null);
        });
      } else if (peopleId) {
        updateUserFollowPeopleCount(user._id, function(){
          callback(null);
        });
      } else {
        callback(null)
      }

    },
    // 更新node被收藏的总数量
    function(callback) {


      if (topicId) {
        // 关注话题
        updateTopicFollowCount(topicId, function(){
          callback(null);
        });
      } else if (postsId) {
        // 关注帖子
        updatePostsFollowCount(postsId, function(){
          callback(null);
        });
      } else if (peopleId) {
        // 关注用户
        updatePeopleFollowCount(peopleId, function(){
          callback(null);
        });
      } else {
        callback(null)
      }
    }
  ], function(err, result){

    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true
      });
    }

  });

};




// 关注节点
exports.remove = function(req, res, next) {

  var user = req.user;
  var topicId = req.body.topic_id;
  var postsId = req.body.posts_id;
  var peopleId = req.body.people_id;

  var topic = null;
  var posts = null;
  var people = null;

  async.waterfall([

    function(callback) {
      if (!topicId && !postsId && !peopleId) {
        callback(14000);
      } else {
        callback(null);
      }
    },

    // 查询话题是否存在
    function(callback) {

      if (!topicId) {
        callback(null)
        return
      }

      Topic.fetch({ _id: topicId }, { _id: 1, parent_id: 1 }, {}, function(err, data){
        if (err) console.log(err);

        if (!data || data.length == 0) {
          callback(15000);
        } else {

          if (!data[0].parent_id) {
            callback(15001);
          } else {
            topic = data[0]
            callback(null);
          }

        }
      });
    },

    // 查询帖子是否存在
    function(callback) {

      if (!postsId) {
        callback(null)
        return
      }

      Posts.find({ _id: postsId }, { user_id:1, _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(11000);
        } else if (data[0].user_id + '' == user._id) {
          callback(15002)
        } else {
          posts = data[0]
          callback(null);
        }
      });
    },

    // 查询用户是否存在
    function(callback) {

      if (!peopleId) {
        callback(null)
        return
      }

      User.fetch({ _id: peopleId }, { _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(13000);
        } else {
          people = data[0]
          callback(null);
        }
      });
    },

    function(callback) {

      var query = { user_id: user._id }

      if (topicId) query.topic_id = topicId
      else if (postsId) query.posts_id = postsId
      else if (peopleId) query.people_id = peopleId

      Follow.fetch(query, {}, {}, function(err, data){
        if (err) console.log(err);
        data = data && data.length > 0 ? data[0] : null
        if (!data || data.deleted) {
          callback(14002)
        } else {
          callback(null, data._id)
        }
      })
    },

    function(id, callback) {

      var notice = null

      if (postsId) {
        notice = {
          type: 'follow-posts',
          posts_id: postsId,
          sender_id: user._id,
          addressee_id: posts.user_id
        }
      } else if (peopleId) {
        notice = {
          type: 'follow-you',
          sender_id: user._id,
          addressee_id: peopleId
        }
      }

      Follow.update({ _id: id }, { deleted: true }, function(err){
        if (err) {
          console.log(err);
          callback(10003);
        } else {

          if (notice) {
            UserNotification.delete(notice, function(){
              callback(null);
            })
          } else {
            callback(null);
          }


        }
      });
    },
    // 更新用户自己收藏的节点数量
    function(callback) {

      if (topicId) {
        updateUserTopicCount(user._id, function(){
          callback(null);
        });
      } else if (postsId) {
        updateUserPostsCount(user._id, function(){
          callback(null);
        });
      } else if (peopleId) {
        updateUserFollowPeopleCount(user._id, function(){
          callback(null);
        });
      } else {
        callback(null)
      }

    },
    // 更新node被收藏的总数量
    function(callback) {
      if (topicId) {
        updateTopicFollowCount(topicId, function(){
          callback(null);
        });
      } else if (postsId) {
        updatePostsFollowCount(postsId, function(){
          callback(null);
        });
      } else if (peopleId) {
        updatePeopleFollowCount(peopleId, function(){
          callback(null);
        });
      } else {
        callback(null)
      }
    }
  ], function(err, result){
    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true
      });
    }
  });

};
