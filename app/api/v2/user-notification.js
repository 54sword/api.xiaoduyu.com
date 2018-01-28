// var UserNotification = require('../../modelsa').UserNotification;
var Notification = require('../../models').Notification;
var Answer = require('../../models').Answer;
var Question = require('../../models').Question;
var Posts = require('../../models').Posts;
var User = require('../../models').User;

var async = require('async');

import UserNotification from '../../modelsa/user-notification'

exports.find = async (req, res, next) => {

  // 请求用户的角色
  let admin = req.role && req.role == 'admin' ? true : false

  const user = req.user
  let { query, select, options } = req.arguments


  if (user.block_people_count > 0 && !admin) {
    query.sender_id = { '$nin': user.block_people }
  }

  options.populate = []

  if (Reflect.has(select, 'addressee_id')) {
    options.populate.push({
      path: 'addressee_id',
      select: { _id: 1, nickname: 1, avatar: 1, create_at: 1 }
    })
  }

  if (Reflect.has(select, 'sender_id')) {
    options.populate.push({
      path: 'sender_id',
      select: { _id: 1, nickname: 1, avatar: 1, create_at: 1 }
    })
  }

  if (Reflect.has(select, 'posts_id')) {
    options.populate.push({
      path: 'posts_id',
      match: admin ? {} : { 'deleted': false },
      select: { _id: 1, title: 1, content_html: 1, type: 1 }
    })
  }

  if (Reflect.has(select, 'comment_id')) {
    options.populate.push({
      path: 'comment_id',
      match: admin ? {} : { 'deleted': false },
      select: { _id: 1, content_html: 1,  posts_id: 1, reply_id: 1, parent_id: 1 }
    })
  }

  let notificationList = await UserNotification.find({ query, select, options })

  options = []

  if (Reflect.has(select, 'comment_id')) {
    options = [
      {
        path: 'comment_id.posts_id',
        model: 'Posts',
        match: admin ? {} : { 'deleted': false },
        select: { '_id': 1, 'title': 1, type: 1 }
      },
      {
        path: 'comment_id.parent_id',
        model: 'Comment',
        match: admin ? {} : { 'deleted': false },
        select: { '_id': 1, 'content_html': 1 }
      },
      {
        path: 'comment_id.reply_id',
        model: 'Comment',
        match: admin ? {} : { 'deleted': false },
        select: { '_id': 1, 'content_html': 1 }
      }
    ]
  }

  notificationList = await UserNotification.populate({ collections: notificationList, options })


  // 删除一些，通知
  let _notices = JSON.stringify(notificationList);
  _notices = JSON.parse(_notices);

  if (_notices && _notices.map) {
    _notices.map(function(item, key){
      if (typeof item.comment_id != 'undefined' && item.comment_id == null ||
        typeof item.posts_id != 'undefined' && item.posts_id == null ||
        item.comment_id && typeof item.comment_id.posts_id != 'undefined' && item.comment_id.posts_id == null ||
        item.comment_id && typeof item.comment_id.parent_id != 'undefined' && item.comment_id.parent_id == null ||
        item.comment_id && typeof item.comment_id.reply_id != 'undefined' && item.comment_id.reply_id == null
        ) {
          item.type = 'delete'
      }
    })
  }

  _notices.map(function(item, key){

    if (item.comment_id) {
      var text = item.comment_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].comment_id.content_trim = text
    }

    if (item.comment_id && item.comment_id.parent_id) {
      var text = item.comment_id.parent_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].comment_id.parent_id.content_trim = text
    }

    if (item.comment_id && item.comment_id.reply_id) {
      var text = item.comment_id.reply_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].comment_id.reply_id.content_trim = text
    }

    if (item.answer_id) {
      var text = item.answer_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].answer_id.content_trim = text
    }

    if (item.comment_id && item.comment_id.answer_id) {
      var text = item.comment_id.answer_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].comment_id.answer_id.content_html = text
    }
  })

  res.send({ success: true, data: _notices })
}

exports.update = async (req, res) => {

  const user = req.user
  let { query, update, options } = req.arguments

  if (!query._id) {
    return res.send({ success: false, error: 90002, error_data: { argument: 'query._id' } })
  }

  try {
    await UserNotification.update({ query, update, options })
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false, error: 10003 })
  }

}

exports.fetch = function(req, res, next) {

  var user = req.user,
      ltCreateAt = req.body.lt_create_at,
      gtCreateAt = req.body.gt_create_at,
      perPage = req.body.per_page || 20,
      // 管理员查询
      admin = req.body.admin || req.query.admin || 0,
      query = {},
      select = { __v: 0, addressee_id: 0, deleted: 0 },
      options = {}

  async.waterfall([

    (callback) => {
      if (admin) {
        select = { __v: 0 }
      } else {
        query.addressee_id = user._id
        query.deleted = false
        // 增加屏蔽条件
        if (user.block_people_count > 0) query.sender_id = { '$nin': user.block_people }
      }
      callback(null)
    },

    function(callback) {

      // 增加屏蔽条件
      // if (user && !admin) {
      //   if (user.block_people_count > 0) query.sender_id = { '$nin': user.block_people }
      // }

      if (ltCreateAt) query.create_at = { '$lt': ltCreateAt }
      if (gtCreateAt) query.create_at = { '$gt': gtCreateAt }

      options.limit = parseInt(perPage)

      options.sort = { create_at: -1 }

      options.populate = [
        { path: 'addressee_id', select: { _id: 1, nickname: 1, avatar: 1, create_at: 1  } },
        { path: 'sender_id', select: { _id: 1, nickname: 1, avatar: 1, create_at: 1  } },
        { path: 'posts_id', match: { 'deleted': false }, select: { _id: 1, title: 1, content_html: 1, type: 1 } },
        { path: 'comment_id', match: { 'deleted': false }, select: { _id: 1, content_html: 1,  posts_id: 1, reply_id: 1, parent_id: 1 }  }
      ]

      UserNotification.find(query, select, options, function(err, notices){
        if (err) console.log(err)
        callback(null, notices)
      })

    },

    function(notices, callback) {

      var options = [
        {
          path: 'comment_id.posts_id',
          model: 'Posts',
          match: { 'deleted': false },
          select: { '_id': 1, 'title': 1, type: 1 }
        },
        {
          path: 'comment_id.parent_id',
          model: 'Comment',
          match: { 'deleted': false },
          select: { '_id': 1, 'content_html': 1 }
        },
        {
          path: 'comment_id.reply_id',
          model: 'Comment',
          match: { 'deleted': false },
          select: { '_id': 1, 'content_html': 1 }
        }
      ]

      Posts.populate(notices, options, function(err, notices){
        if (err) console.log(err)
        callback(null, notices)
      })

    },

    function(notices, callback) {
      // 删除一些，通知
      var _notices = JSON.stringify(notices);
      _notices = JSON.parse(_notices);

      if (_notices && _notices.map) {
        _notices.map(function(item, key){
          if (typeof item.comment_id != 'undefined' && item.comment_id == null ||
            typeof item.posts_id != 'undefined' && item.posts_id == null ||
            item.comment_id && typeof item.comment_id.posts_id != 'undefined' && item.comment_id.posts_id == null ||
            item.comment_id && typeof item.comment_id.parent_id != 'undefined' && item.comment_id.parent_id == null ||
            item.comment_id && typeof item.comment_id.reply_id != 'undefined' && item.comment_id.reply_id == null
            ) {
              item.type = 'delete'
            // _notices.splice(key, 1);
            return
          }
        })
      }

      // console.log(notices);

      if (notices && notices.length && !admin) {
        // 未读的通知设置成已读
        for (var i = 0, max = notices.length; i < max; i++) {
          if (notices[i].has_read == false) {
            notices[i].has_read = true;
            notices[i].save();
          }
        }
      }

      callback(null, _notices)

    }

  ], function(err, _notices){

    _notices.map(function(item, key){

      if (item.comment_id) {

        var text = item.comment_id.content_html

        text = text.replace(/<[^>]+>/g,"");

        if (text.length > 100) {
          text = text.substring(0,100) + '...'
        }

        _notices[key].comment_id.content_trim = text
      }

      if (item.comment_id && item.comment_id.parent_id) {

        var text = item.comment_id.parent_id.content_html

        text = text.replace(/<[^>]+>/g,"");

        if (text.length > 100) {
          text = text.substring(0,100) + '...'
        }

        _notices[key].comment_id.parent_id.content_trim = text
      }

      if (item.comment_id && item.comment_id.reply_id) {

        var text = item.comment_id.reply_id.content_html

        text = text.replace(/<[^>]+>/g,"");

        if (text.length > 100) {
          text = text.substring(0,100) + '...'
        }

        _notices[key].comment_id.reply_id.content_trim = text
      }


      if (item.answer_id) {

        var text = item.answer_id.content_html

        text = text.replace(/<[^>]+>/g,"");

        if (text.length > 100) {
          text = text.substring(0,100) + '...'
        }

        _notices[key].answer_id.content_trim = text
      }

      if (item.comment_id && item.comment_id.answer_id) {

        var text = item.comment_id.answer_id.content_html

        text = text.replace(/<[^>]+>/g,"");

        if (text.length > 100) {
          text = text.substring(0,100) + '...'
        }

        _notices[key].comment_id.answer_id.content_html = text
      }
    })

    res.send({ success: true, data: _notices })

  })

}


exports.fetchUnreadCount = function(req, res) {
  var user = req.user

  async.waterfall([

    // 拉取通知
    function(callback) {

      var query = { addressee_id: user._id, deleted: false }

      if (user.find_notification_at) query.create_at = { '$gt': user.find_notification_at }

      Notification.find(query, {}, { sort:{ 'create_at': -1 } },
        function(err, notice){
          if (err) console.log(err);

          if (notice.length > 0) {

            // 更新用户最近一次拉取通知的时间
            User.update({ _id: user._id }, { find_notification_at: notice[0].create_at }, function(err, result){
              if (err) console.log(err);
            })

            var notificationArr = []

            notice.map(function(item){
              if (item.type == 'new-comment') {
                notificationArr.push({
                  sender_id: item.sender_id,
                  comment_id: item.target,
                  addressee_id: user._id,
                  create_at: item.create_at,
                  type: item.type
                })
              }
            })

            UserNotification.create(notificationArr, function(err){
              if (err) console.log(err)
              callback(null)
            })
            return
          }

          callback(null)
        })

    },
    function(callback){

      let query = {
        addressee_id: user._id, has_read: false, deleted: false
      }

      // 增加屏蔽条件
      if (user) {
        if (user.block_people_count > 0) query.sender_id = { '$nin': user.block_people }
      }

      UserNotification.find(query, { _id:1 }, {}, function(err, result){
        if (err) console.log(err);

        let ids = []
        if (result) result.map(item=>ids.push(item._id))

        res.send({
          success: true,
          data: ids
        })
      })

    }
  ], function(err, result){

  })

}

exports.add = function(data, callback) {

  UserNotification.findOne(data, {}, function(err, notice){

    if (err) console.log(err);

    if (notice) {
      UserNotification.update({ _id: notice._id }, { deleted: false }, function(err){
        if (err) console.log(err)
        global.io.sockets.emit('notiaction', [data.addressee_id]);
        callback()
      })
      return
    }

    // 添加通知
    UserNotification.save(data, function(err){
      if (err) console.log(err)
      global.io.sockets.emit('notiaction', [data.addressee_id]);
      callback()
    })

  })

}

exports.delete = function(query, callback) {

  UserNotification.findOne(query, {}, function(err, notice){

    if (notice) {
      UserNotification.update({ _id: notice._id }, { deleted: true }, function(err){
        if (err) console.log(err)

        global.io.sockets.emit('cancel-notiaction', notice._id);

        callback()
      })
    } else {
      callback()
    }
  })
}
