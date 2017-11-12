import { Topic, Posts, User, Follow, Block } from '../../models'
import async from 'async'
import UserNotification from './user-notification'

exports.fetch = function(req, res, next) {

  var user = req.user;
  // var userId = req.query.user_id;
  var page = req.query.page || 0;
  var perPage = req.query.per_page || 20;
  // 查询某个存在字段
  // var field = req.query.field || null;
  // var postsId = req.query.posts_id || '';
  // var topicsId = req.query.topics_id || '';
  // var peopleId = req.query.people_id || '';
  var people_exsits = req.query.people_exsits;
  var posts_exsits = req.query.posts_exsits;

  var query = { deleted: false }
  var select = { __v: 0, create_at: 0, deleted: 0 }
  var options = {}

  // query

  if (typeof people_exsits != 'undefined') {
    query.people_id = { $exists: people_exsits ? true : false }
    query.user_id = user._id
  }

  if (typeof posts_exsits != 'undefined') {
    query.posts_id = { $exists: posts_exsits ? true : false }
    query.user_id = user._id
  }

  // if (userId) query.user_id = userId
  // if (postsId) query.posts_id = postsId
  // if (topicsId) query.topics_id = topicsId
  // if (peopleId) query.people_id = peopleId

  // option

  if (page > 0) options.skip = page * perPage
  if (perPage > 300) perPage = 300
  options.limit = parseInt(perPage)
  options.sort = { 'create_at': -1 }

  options.populate = [
    {
      path: 'people_id',
      select: {
        '_id': 1, 'avatar': 1, 'nickname': 1
      }
    },
    {
      path: 'posts_id',
      match: { 'deleted': false },
      select: {
        '_id': 1, 'create_at': 1, title: 1
      }
    }
  ]

  Block.find({
    query,
    select,
    options,
    callback: (err, follows) => {
      if (err) console.log(err)
      res.send({
        success: true,
        data: follows
      })
    }
  })

}

function updateUserBlockPostsCount(userId, callback) {

  Block.find({
    query: {
      user_id: userId,
      posts_id: { $exists: true },
      deleted: false
    },
    select: { posts_id: 1, _id: 0 },
    callback: (err, data) => {

      if (err) {
        console.log(err);
        return callback()
      }

      var ids = []
      data.map(function(item){ ids.push(item.posts_id) })

      User.update({ _id: userId }, { block_posts: ids, block_posts_count: ids.length }, function(err){
        if (err) console.log(err);
        callback(null);
      })
    }

  })

}


function updateUserBlockPeopleCount(userId, callback) {

  Block.find({
    query: {
      user_id: userId,
      people_id: { $exists: true },
      deleted: false
    },
    select: { people_id: 1, _id: 0 },
    callback: (err, data) => {

      if (err) {
        console.log(err);
        return callback()
      }

      var ids = []
      data.map(function(item){ ids.push(item.people_id) })

      User.update({ _id: userId }, { block_people: ids, block_people_count: ids.length }, function(err){
        if (err) console.log(err);
        callback(null);
      })

    }

  })

}


exports.add = function(req, res, next) {

  var user = req.user;
  // var topicId = req.body.topic_id;
  var postsId = req.body.posts_id;
  var peopleId = req.body.people_id;

  // var topic = null;
  var posts = null;
  var people = null;

  async.waterfall([

    (callback) => {
      if (!postsId && !peopleId) {
        callback(60000)
      } else {
        callback(null)
      }
    },

    /*
    // 查询话题是否存在
    function(callback) {

      if (!topicId) return callback(null)

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
    */

    // 查询帖子是否存在
    (callback) => {

      if (!postsId) return callback(null)

      Posts.find({ _id: postsId }, { user_id:1, _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(11000);
        } else if (data[0].user_id + '' == user._id) {
          callback(60004)
        } else {
          posts = data[0]
          callback(null);
        }
      })
    },

    // 查询用户是否存在
    (callback) => {

      if (!peopleId) return callback(null)

      User.fetch({ _id: peopleId }, { _id: 1 }, {}, function(err, data){
        if (err) console.log(err);
        if (!data || data.length == 0) {
          callback(13000)
        } else if (data[0]._id + '' == user._id) {
          callback(60002)
        } else {
          people = data[0]
          callback(null)
        }
      })

    },

    (callback) => {

      var query = { user_id: user._id }

      if (postsId) query.posts_id = postsId
      else if (peopleId) query.people_id = peopleId

      Block.find({
        query,
        callback: (err, data) => {
          if (err) console.log(err);
          data = data && data.length > 0 ? data[0] : null
          if (!data) {
            callback(null, null);
          } else if (data.deleted) {
            callback(null, data)
          } else {
            callback((postsId ? 60003 : 60001));
          }
        }
      })

    },

    // 添加收藏记录
    (collect, callback) => {

      if (!collect) {

        var data = { user_id: user._id }

        if (postsId) data.posts_id = postsId
        else if (peopleId) data.people_id = peopleId

        // 不存在则添加记录
        Block.save({
          data,
          callback: (err) => {
            if (err) {
              console.log(err);
              callback(10002);
            } else {
              callback(null);
            }
          }
        });
      } else {
        // 如果存在那么取消删除的标记
        Block.update({
          condition: { _id: collect._id },
          contents: { deleted: false },
          callback: (err) => {
            if (err) {
              console.log(err);
              callback(10003);
            } else {
              callback(null);
            }
          }
        })
      }
    },

    // 更新用户自己收藏的节点数量
    (callback) => {
      if (postsId) {
        updateUserBlockPostsCount(user._id, ()=>callback(null))
      } else if (peopleId) {
        updateUserBlockPeopleCount(user._id, ()=>callback(null))
      } else {
        callback(null)
      }

    }
  ], (err, result) => {

    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      })
    } else {

      let query = {}

      if (postsId) query.posts_id = postsId
      else if (peopleId) query.people_id = peopleId

      Block.findOne({
        query,
        select:{ __v: 0, create_at: 0, deleted: 0 },
        options: {
          populate: [
            {
              path: 'people_id',
              select: {
                '_id': 1, 'avatar': 1, 'nickname': 1
              }
            },
            {
              path: 'posts_id',
              match: { 'deleted': false },
              select: {
                '_id': 1, 'create_at': 1, title: 1
              }
            }
          ]
        },
        callback: (err, follows) => {
          if (err) console.log(err)
          // console.log(follows);
          res.send({
            success: true,
            data: follows
          })
        }
      })


    }

  });

};




// 关注节点
exports.remove = function(req, res, next) {

  var user = req.user;
  // var topicId = req.body.topic_id;
  var postsId = req.body.posts_id;
  var peopleId = req.body.people_id;

  // var topic = null;
  var posts = null;
  var people = null;

  async.waterfall([

    (callback) => {
      if (!postsId && !peopleId) {
        callback(14000)
      } else {
        callback(null)
      }
    },

    /*
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
    */

    // 查询帖子是否存在
    (callback) => {

      if (!postsId) return callback(null)

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
    (callback) => {

      if (!peopleId) return callback(null)

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

    (callback) => {

      var query = { user_id: user._id }

      if (postsId) query.posts_id = postsId
      else if (peopleId) query.people_id = peopleId

      Block.findOne({
        query,
        callback: (err, data)=>{
          if (err) console.log(err);
          if (!data || data.deleted) {
            callback(14002)
          } else {
            callback(null, data._id)
          }
        }
      })
    },

    (id, callback) => {
      Block.update({
        condition: { _id: id },
        contents: { deleted: true },
        callback: (err) => {
          if (err) {
            console.log(err);
            callback(10003);
          } else {
            callback(null);
          }
        }
      })
    },
    // 更新用户自己收藏的节点数量
    (callback) => {
      if (postsId) {
        updateUserBlockPostsCount(user._id, function(){
          callback(null)
        });
      } else if (peopleId) {
        updateUserBlockPeopleCount(user._id, function(){
          callback(null)
        })
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
