var Like = require('../../models').Like;
var Answer = require('../../models').Answer;
var Comment = require('../../models').Comment;
var Question = require('../../models').Question;
var UserNotification = require('./user-notification');
var Posts = require('../../models').Posts;
var Comment = require('../../models').Comment;

var async = require('async');

exports.add = function(req, res, next) {

  var user = req.user;
  var type = req.body.type;
  var targetId = req.body.target_id;
  var mood = req.body.mood;

  async.waterfall([

    // 判断目标对象是否存在
    function(callback) {

      if (type == 'comment' || type == 'reply') {
        var model = Comment
      } else if (type == 'posts') {
        var model = Posts
      } else {
        callback(16000)
        return
      }

      model.findOne({ _id: targetId }, {}, function(err, data){
        if (err) console.log(err)

        if (!data) {
          callback(16001)
        } else if (user._id + '' == data.user_id + '') {
          callback(16005)
        } else {
          callback(null, data)
        }
      })

    },

    // 添加like
    function(data, callback) {

      Like.findOne({ user_id: user._id, type: type, target_id: targetId }, {}, function(err, like){

        if (err) console.log(err)
        if (like) {

          if (like.deleted == false) {
            callback(16002)
            return
          }

          Like.update({ _id: like._id }, { deleted: false }, function(){
            callback(null, data)
          })

        } else {

          Like.save({
            user_id: user._id,
            type: type,
            target_id: targetId,
            mood: mood
          }, function(err, result){

            if (err) {
              console.log(err)
              callback(16003)
            } else {
              callback(null, data)
            }

          })

        }
      })
    },

    // 发送like的通知
    function(comment, callback) {

      if (user._id + '' == comment.user_id._id + '') {
        callback(null)
        return
      }

      var params = null

      if (type == 'comment' && user._id + '' != comment.user_id + '') {
        params = {
          type: 'like-comment',
          sender_id: user._id,
          addressee_id: comment.user_id,
          comment_id: comment._id
        }
      } else if (type == 'reply' && user._id + '' != comment.user_id + '') {
        params = {
          type: 'like-reply',
          sender_id: user._id,
          addressee_id: comment.user_id,
          comment_id: comment._id
        }
      } else if (type == 'posts' && user._id + '' != comment.user_id + '') {
        params = {
          type: 'like-posts',
          sender_id: user._id,
          addressee_id: comment.user_id,
          posts_id: comment._id
        }
      }

      if (params) {
        UserNotification.add(params, function(err){
          callback(null)
        })
      } else {
        callback(null)
      }

    },

    // 更新like的累积数
    function(callback) {

      var model = null
      
      if (type == 'comment' || type == 'reply') {
        model = Comment
      } else if (type == 'posts') {
        model = Posts
      }

      if (!model) {
        callback(null)
        return
      }

      Like.count({ target_id: targetId, deleted: false }, function(err, total){
        if (err) {
          console.log(err);
          callback(null)
        } else {
          model.update({ _id: targetId }, { like_count: total }, function(err){
            if (err) console.log(err);
            callback(null)
          })
        }

      })

    }
  ], function(err, result) {

    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      });
      return
    }

    res.send({
      success: true
    });

  });

};


exports.unlike = function(req, res, next) {

  var user = req.user;
  var targetId = req.body.target_id;
  var type = req.body.type;

  async.waterfall([

    // 判断目标对象是否存在
    function(callback) {

      if (type == 'comment' || type == 'reply') {
        var model = Comment
      } else if (type == 'posts') {
        var model = Posts
      } else {
        callback(16000)
        return
      }

      model.findOne({ _id: targetId }, {}, function(err, data){
        if (err) console.log(err)
        if (!data) {
          callback(16001)
        } else {
          callback(null, data)
        }
      })

    },

    function(result, callback) {

      Like.findOne({
        user_id: user._id,
        target_id: targetId,
        type: type
      }, { _id: 1 }, function(err, like) {
        if (err) console.log(err)
        if (!like) {
          callback(16004)
        } else {
          callback(null, like, result)
        }
      })

    },

    function(like, result, callback) {

      Like.update({ _id: like._id }, { deleted: true }, function(err){
        if (err) console.log(err)
        callback(null, result)
      })

    },

    // 取消like的通知
    function(answer, callback) {

      if (user._id + '' == answer.user_id + '') {
        callback(null)
        return
      }

      var params = null

      if (type == 'comment') {
        params = {
          type: 'like-comment',
          sender_id: user._id,
          addressee_id: answer.user_id,
          comment_id: answer._id
        }
      } else if (type == 'reply') {
        params = {
          type: 'like-reply',
          sender_id: user._id,
          addressee_id: answer.user_id,
          comment_id: answer._id
        }
      } else if (type == 'posts') {
        params = {
          type: 'like-posts',
          sender_id: user._id,
          addressee_id: answer.user_id,
          posts_id: answer._id
        }
      }

      if (params) {
        UserNotification.delete(params, function(err){
          callback(null)
        })
      } else {
        callback(null)
      }

    },

    // 更新like的累积数
    function(callback) {

      var model = null

      if (type == 'comment' || type == 'reply') {
        model = Comment
      } else if (type == 'posts') {
        model = Posts
      }

      if (!model) {
        callback(null)
        return
      }


      Like.count({ target_id: targetId, deleted: false }, function(err, total){

        if (err) {
          console.log(err);
          callback(null)
        } else {
          model.update({ _id: targetId }, { like_count: total }, function(err){
            if (err) console.log(err);
            callback(null)
          })
        }

      })

    }

  ], function(err, result){

    if (err) {
      res.status(401);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true
      });
    }

  })

};
