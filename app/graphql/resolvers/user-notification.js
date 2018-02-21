
import UserNotification from '../../modelsa/user-notification'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.userNotifications = async (root, args, context, schema) => {

  if (!context.user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys({ args, model:'user-notification', role })

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===

  // 请求用户的角色
  let admin = role == 'admin' ? true : false
  let err, notificationList


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
  };

  [ err, notificationList ] = await To(UserNotification.find({ query, select, options }))

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

  [ err, notificationList ] = await To(UserNotification.populate({ collections: notificationList, options }))

  // console.log(notificationList);

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

  // let [ err, userList ] = await To(User.find({ query, select, options }))

  return _notices
}

query.userNotificationsCount = async (root, args, context, schema) => {

  if (!context.user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  const { user, role } = context
  let { query } = Querys({ args, model:'user-notification', role })

  //===
  
  // 请求用户的角色
  let admin = role == 'admin' ? true : false

  if (user.block_people_count > 0 && !admin) {
    query.sender_id = { '$nin': user.block_people }
  }

  let [ err, count ] = await To(UserNotification.count({ query }))

  return { count }
}

mutation.updateUserNotifaction = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let options = {}
  let { query, update } = Updates({ args, model: 'user-notification', role })

  //===

  let [ err, result ] = await To(UserNotification.update({ query, update, options }))

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
