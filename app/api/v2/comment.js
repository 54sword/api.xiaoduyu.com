// var Comment = require('../../modelsa').Comment;
var Posts = require('../../models').Posts;
var User = require('../../models').User;
var Like = require('../../models').Like;
var Follow = require('../../models').Follow;
var UserNotification = require('./user-notification');
var Notification = require('./notification');


var async = require('async');
var xss = require('xss');
var Tools = require('../../common/tools');
var jpush = require('../../common/jpush');

import Comment from '../../modelsa/comment'

import isJSON from 'is-json'

import _comment from './params-white-list/comment'
import _checkParams from './params-white-list'

const checkParams = (dataJSON) => {
  return _checkParams(dataJSON, _comment)
}


// 添加
exports.add = function(req, res) {

  var user          = req.user;
  var postsId       = req.body.posts_id;
  var replyId       = req.body.reply_id || '';
  var parentId      = req.body.parent_id || '';
  var content       = req.body.content;
  var contentHTML   = req.body.content_html;
  var ip            = Tools.getIP(req);
  var deviceId      = req.body.device_id || 1;

  var posts = null
  var parentComment = null
  var replyComment = null

  async.waterfall([

    // 判断ip是否存在
    function(callback) {
      callback(ip ? null : 10000);
    },

    (callback) => {

      // 判断是否禁言
      if (user && user.banned_to_post &&
        new Date(user.banned_to_post).getTime() > new Date().getTime()
      ) {
        let countdown = Countdown(new Date(), user.banned_to_post)
        callback({ error: 10008, error_data: countdown })
      } else {
        callback(null)
      }

    },

    function(callback) {

      if (!postsId) {
        callback(11000);
        return
      }

      Posts.find({ _id: postsId }, { user_id:1, _id:1, create_at:1 }, {}, function(err, data){
        if (err) console.log(err)

        if (!data || data.length == 0) {
          callback(11000)
        // } else if (data[0].user_id + '' == user._id && !parentId) {
        //   callback(12006)
        } else {
          posts = data[0]
          callback(null)
        }
      })

    },

    function(callback) {

      if (!parentId) {
        callback(null)
        return
      }

      Comment.fetch({ _id: parentId }, { _id:1, posts_id:1, user_id:1, content_html:1 }, {}, function(err, data){
        if (err) console.log(err)
        if (!data || data.length == 0) {
          callback(12000);
        } else {
          if (data[0].posts_id != postsId) {
            callback(12001)
          } else {
            parentComment = data[0]
            callback(null);
          }
        }
      })

    },

    function(callback) {

      if (!replyId) {
        callback(null)
        return
      }

      Comment.fetch({ _id: replyId }, { _id:1, user_id:1 }, {}, function(err, data){
        if (err) console.log(err)
        if (!data || data.length == 0) {
          callback(12002);
        } else {
          replyComment = data[0]
          callback(null);
        }
      })

    },


    function(callback) {

      callback(null)
      return

      /*
      // 一个用户只能评论一次
      if (postsId && !parentId && !replyId) {

        Comment.fetch(
          { user_id: user._id, posts_id: postsId, parent_id: { $exists : false } },
          { _id:1 },
          {},
          function(err, data){
            if (err) console.log(err)
            if (data && data.length == 0) {
              callback(null)
            } else if (data && data.length > 0) {
              callback(12003);
            } else {
              callback(10001)
            }
          })

      } else {
        callback(null)
      }
      */

    },


    // 添加评论
    function(callback) {

      content = xss(content, {
        whiteList: {},
        stripIgnoreTag: true,
        onTagAttr: function (tag, name, value, isWhiteAttr) {
          return '';
        }
      });

      contentHTML = xss(contentHTML, {
        whiteList: {
          a: ['href', 'title', 'target', 'rel'],
          img: ['src', 'alt'],
          p: [],
          div: [],
          br: [],
          blockquote: [],
          li: [],
          ol: [],
          ul: [],
          strong: [],
          em: [],
          u: [],
          pre: [],
          b: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          h7: []
        },
        stripIgnoreTag: true,
        onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
          if (tag == 'div' && name.substr(0, 5) === 'data-') {
            // 通过内置的escapeAttrValue函数来对属性值进行转义
            return name + '="' + xss.escapeAttrValue(value) + '"';
          }
        }
      });

      let _contentHTML = contentHTML
      _contentHTML = _contentHTML.replace(/<img[^>]+>/g,"1")
      _contentHTML = _contentHTML.replace(/<[^>]+>/g,"")

      if (!content || !contentHTML || _contentHTML == '') {
        callback(12004);
        return;
      }

      var comment = {
        user_id: user._id,
        content: content,
        content_html: contentHTML,
        posts_id: postsId,
        ip: ip,
        deviceId: deviceId
      }

      // 评论的回复
      if (parentId) comment.parent_id = parentId
      // 评论的回复的回复
      if (parentId && replyId) comment.reply_id = replyId

      Comment.save(comment, function(err, comment){
        if (err) console.log(err);
        callback(null, comment);
      });

    },

    function(comment, callback) {

      if (postsId && !parentId && !replyId) {

        // 评论

        var update = {
          $inc: { 'comment_count': 1 },
          $addToSet: { comment: comment._id }
        }

        // 如果帖子创建日期，小于30天，置顶帖子
        if (new Date().getTime() - new Date(posts.create_at).getTime() < 1000 * 60 * 60 * 24 * 30) {
          update.sort_by_date = new Date()
        }

        // 更新评论累积+1，新评论储存到comment
        Posts.update(
          { _id: postsId },
          update,
          function(err){
            if (err) console.log(err);

            // 用户评论次数+1
            User.update(
              { _id: user._id },
              { $inc: { comment_count: 1 } },
              function(err){
                if (err) console.log(err);

                if (user._id + '' != posts.user_id + '') {
                  // 发送通知邮件给帖子作者
                  UserNotification.add(
                    { type: 'comment', sender_id: user._id, addressee_id: posts.user_id, comment_id: comment._id },
                    function(err){
                      if (err) console.log(err)
                  });

                  jpush.pushCommentToUser({ comment, posts, user })
                }

                // 查询出所有关注该帖子的用户，然后发送通知给他们
                Follow.find(
                  { posts_id: posts._id, user_id: { $ne: user._id } },
                  { user_id: 1 },
                  {},
                  function(err, data){

                    var userIds = []

                    data.map(function(follow){
                      if (userIds.indexOf(follow.user_id) == -1) {
                        userIds.push(follow.user_id)
                      }
                    })

                    if (userIds.length > 0) {
                      Notification.add(
                        { type: 'new-comment', sender_id: user._id, addressee_id: userIds, target: comment._id },
                        function(err){
                          if (err) console.log(err)
                          callback(null, comment)
                        });
                    } else {
                      callback(null, comment)
                    }

                  });

              });

          });

      } else if (postsId && parentId) {

        // 回复

        Comment.update(
          { _id: parentId },
          { '$addToSet': { 'reply': comment._id }, $inc: { 'reply_count': 1 } },
          function(err){
            if (err) console.log(err);

            // console.log(replyComment);
            // console.log(user._id);

            if (replyComment && replyComment.user_id == user._id + '') {
              callback(null, comment)
              // 如果是自己回复自己，那么则不发送通知
            } else {

              // 发送通知
              UserNotification.add({
                type: 'reply',
                sender_id: user._id,
                addressee_id: replyId ? replyComment.user_id : parentComment.user_id,
                comment_id: comment._id,
              }, function(err){
                if (err) console.log(err)
                callback(null, comment)
              })

              jpush.pushReplyToUser({ comment: parentComment, reply: comment, user })

            }

          })

      } else {
        callback(null, comment)
      }


    }

  ], function(err, result){

    if (err) {
      res.status(401);

      if (typeof err == 'number') {
        res.send({
          success: false,
          error: err
        })
      } else {
        err.success = false
        res.send(err)
      }

    } else {
      res.send({
        success: true,
        data: result
      });
    }
  })

}


exports.update = async (req, res) => {

  const user = req.user
  let { query, update, options } = req.arguments

  if (!query._id) {
    return res.send({ success: false, error: 90002, error_data: { argument: 'query._id' } })
  }

  try {
    await Comment.update({ query, update, options })
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false, error: 10003 })
  }

}

/*
exports.update = function(req, res, next) {

  var user              = req.user;
  var id                = req.body.id || '';
  var answerContent     = req.body.content || '';
  var anaserContentHTMl = req.body.content_html || '';
  // var ip                = Tools.getIP(req);

  async.waterfall([

    // 参数判断
    function(callback) {

      answerContent = xss(answerContent, {
        whiteList: {},
        stripIgnoreTag: true,
        onTagAttr: function (tag, name, value, isWhiteAttr) {
          return '';
        }
      });

      if (!answerContent) {
        callback(12004);
      } else {
        callback(null);
      }

    },

    function(callback) {

      anaserContentHTMl = xss(anaserContentHTMl, {
        whiteList: {
          a: ['href', 'title', 'target', 'rel'],
          img: ['src', 'alt'],
          p: [],
          div: [],
          br: [],
          blockquote: [],
          li: [],
          ol: [],
          ul: [],
          strong: [],
          em: [],
          u: [],
          pre: [],
          b: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          h7: []
        },
        stripIgnoreTag: true,
        onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
          if (tag == 'div' && name.substr(0, 5) === 'data-') {
            // 通过内置的escapeAttrValue函数来对属性值进行转义
            return name + '="' + xss.escapeAttrValue(value) + '"';
          }
        }
      });

      if (!anaserContentHTMl) {
        callback(12004);
      } else {
        callback(null);
      }

    },

    function(callback) {

      var query = { _id: id }
      var select = { }
      var option = { }

      Comment.fetch(query, select, option, function(err, answers){
        if (err) console.log(err);
        if (!answers) {
          callback(12000)
        } else {
          callback(null)
        }
      })

    },

    // 执行添加操作
    function(callback) {

      Comment.update({ _id: id },{
        content: answerContent,
        content_html: anaserContentHTMl,
        update_at: new Date()
      }, function(err) {
        if (err) {
          console.log(err)
          callback(12005);
        } else {
          callback(null)
        }
      });

    }

  ], function(err){
    if (err) {
      res.status(400);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });

};
*/

exports.fetch = async (req, res) => {

  const user = req.user

  let { query, select, options } = req.arguments

  options.populate = []

  if (Reflect.has(select, 'user_id') && select.user_id) {
    options.populate.push([
      { path: 'user_id', select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 } }
    ])
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.populate.push([
      { path: 'reply_id', select:{ 'user_id': 1, '_id': 0 } }
    ])
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.populate.push([
      { path: 'posts_id', select: { _id:1, title:1, content_html:1 } }
    ])
  }

  if (Reflect.has(select, 'reply') && select.reply) {

    // reply 添加屏蔽条件
    if (user && !query._id) {
      options.populate.push({
        path: 'reply',
        select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
        options: { limit: 10 },
        match: { user_id: { '$nin': user.block_people }, deleted: false }
      })
    } else {
      options.populate.push({
        path: 'reply',
        select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
        options: { limit: 10 },
        match: { deleted: false }
      })
    }

  }

  let comments = []

  try {

    comments = await Comment.find({ query, select, options })

    options = []

    if (Reflect.has(select, 'reply') && select.reply) {
      options.push({
        path: 'reply.user_id',
        model: 'User',
        select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
      })
      options.push({
        path: 'reply.reply_id',
        model: 'Comment',
        select:{ '_id': 1, 'user_id': 1 }
      })
    }

    if (Reflect.has(select, 'reply_id') && select.reply_id) {
      options.push({
        path: 'reply_id.user_id',
        model: 'User',
        select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
      })
    }

    if (options.length > 0) {
      comments = await Comment.populate({ collections: comments, options })
    }

    options = []

    if (Reflect.has(select, 'reply') && select.reply) {
      options.push({
        path: 'reply.reply_id.user_id',
        model: 'User',
        select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
      })
    }

    if (options.length > 0) {
      comments = await Comment.populate({ collections: comments, options })
    }

  } catch (err) {
    console.log(err);
    res.send({ success: false })
    return
  }

  // 如果未登录，那么直接返回结果
  if (!user || !select.like || Reflect.has(select, 'like') && !select.like) return res.send({ success: true, data: comments })

  // 查询是否点赞了评论或回复

  comments = JSON.stringify(comments);
  comments = JSON.parse(comments);

  var ids = []

  comments.map(function(item){
    ids.push(item._id)
    if (item.reply) item.reply.map(item => ids.push(item._id))
  })

  if (!select.like || Reflect.has(select, 'like') && !select.like) {
    res.send({ success: true, data: comments, sql: req.arguments })
    return
  }

  Like.find({
    $or: [
      {
        type: 'comment',
        deleted: false,
        target_id: { '$in': ids },
        user_id: user._id
      },
      {
        type: 'reply',
        deleted: false,
        target_id: { '$in': ids },
        user_id: user._id
      }
    ]
  }, { target_id: 1, _id: 0 }, {}, function(err, likes){
    if (err) console.log(err)

    var ids = {}

    likes.map(function(item){
      ids[item.target_id] = 1
    })

    comments.map(function(item){
      if (ids[item._id]) {
        item.like = true
      } else {
        item.like = false
      }

      if (item.reply) {
        item.reply.map(function(item){
          if (ids[item._id]) {
            item.like = true
          } else {
            item.like = false
          }
        })
      }

    })

    res.send({ success: true, data: comments })

  })

}

function Countdown(nowDate, endDate) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)
  var timeCount = lastDate - now
  var days = parseInt( timeCount / (3600*24) )
  var hours = parseInt( (timeCount - (3600*24*days)) / 3600 )
  var mintues = parseInt( (timeCount - (3600*24*days) - (hours*3600)) / 60)
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}
