import { UserNotification, Notification, User } from '../../../models'

import To from '../../../utils/to';
import CreateError from '../../common/errors';


// import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../../config';
// let [ query, mutation, resolvers ] = [{},{},{}];

import * as Model from './arguments'
import { getQuery, getSave, getOption } from '../tools'

const userNotifications = async (root: any, args: any, context: any, schema: any) => {

  if (!context.user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // console.log(context.user);

  const { user, role } = context
  const { method } = args
  let select: any = {}, err, query: any, options: any, notificationList;
  // let { query, options } = Querys({ args, model:'user-notification', role })

  // [ err, query ] = getQuery({ args, model:'user-notification', role });
  // [ err, options ] = getOption({ args, model:'user-notification', role });

  [ err, query ] = getQuery({ args, model: Model.userNotifications, role });
  [ err, options ] = getOption({ args, model: Model.userNotifications, role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item: any)=>select[item.name.value] = 1)

  //===

  // 请求用户的角色
  let admin = role == 'admin' ? true : false;

  if (!admin) {
    query.addressee_id = context.user._id;
  }

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

  // console.log(query);
  // console.log(select);

  [ err, notificationList ] = await To(UserNotification.find({ query, select, options }));

  // console.log(notificationList);

  options = [];

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

  // 删除一些，通知
  let _notices: any = JSON.stringify(notificationList);
  _notices = JSON.parse(_notices);

  let new_notices: any = [];

  if (_notices && _notices.map) {
    _notices.map(function(item: any, key: number){
      if (typeof item.comment_id != 'undefined' && item.comment_id == null ||
        typeof item.posts_id != 'undefined' && item.posts_id == null ||
        item.comment_id && typeof item.comment_id.posts_id != 'undefined' && item.comment_id.posts_id == null ||
        item.comment_id && typeof item.comment_id.parent_id != 'undefined' && item.comment_id.parent_id == null ||
        item.comment_id && typeof item.comment_id.reply_id != 'undefined' && item.comment_id.reply_id == null
        ) {
          // delete _notices[key];
          // item.type = 'delete'
      } else {
        new_notices.push(item)
      }
    })
  }
  
  _notices = new_notices;

  if (notificationList && notificationList.length && role != 'admin') {
    // 未读的通知设置成已读
    for (var i = 0, max = notificationList.length; i < max; i++) {

      if (notificationList[i].has_read == false) {
        // notificationList[i].has_read = true;
        // notificationList[i].save();
        UserNotification.update({
          query: { _id: notificationList[i]._id },
          update: { has_read: true }
        });
      }
    }
  }

  /*
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

    if (item.comment_id && item.comment_id.answer_id) {
      var text = item.comment_id.answer_id.content_html
      text = text.replace(/<[^>]+>/g,"");
      if (text.length > 100) text = text.substring(0,100) + '...'
      _notices[key].comment_id.answer_id.content_html = text
    }
  })
  */

  // let [ err, userList ] = await To(User.find({ query, select, options }))

  return _notices
}

const countUserNotifications = async (root: any, args: any, context: any, schema: any) => {

  if (!context.user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  const { user, role } = context
  let err, query, count;

  [ err, query ] = getQuery({ args, model: Model.userNotifications, role });


  //===

  // 请求用户的角色
  let admin = role == 'admin' ? true : false;

  if (user.block_people_count > 0 && !admin) {
    query.sender_id = { '$nin': user.block_people }
  };

  [ err, count ] = await To(UserNotification.count({ query }))

  return { count }
}


// 获取未读消息的[id]
const fetchUnreadUserNotification = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  // 拉取通知
  let query: any = { addressee_id: user._id, deleted: false };

  if (user.find_notification_at) query.create_at = { '$gt': user.find_notification_at }

  let [ err, res ] = await To(Notification.find({
    query,
    options:{
      sort:{ 'create_at': -1 }
    }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  // 如果有未读通知（广播），生成用户通知
  if (res && res.length > 0) {

    // 更新用户最近一次拉取通知的时间
    [ err ] = await To(User.update({
      query: { _id: user._id },
      update: { find_notification_at: res[0].create_at }
    }));

    if (err) {
      throw CreateError({
        message: '更新失败',
        data: { errorInfo: err.message }
      });
    }

    // 添加用户通知
    let notificationArr: any = [];

    res.map((item: any) => {
      if (item.type == 'new-comment') {
        notificationArr.push({
          sender_id: item.sender_id,
          comment_id: item.target,
          addressee_id: user._id,
          create_at: item.create_at,
          type: item.type
        });
      }
    });

    [ err ] = await To(UserNotification.save({
      data: notificationArr
    }));

    if (err) {
      throw CreateError({
        message: '储存失败',
        data: { errorInfo: err.message }
      });
    }

  }

  query = {
    addressee_id: user._id, has_read: false, deleted: false
  }

  // 增加屏蔽条件
  if (user) {
    if (user.block_people_count > 0) query.sender_id = { '$nin': user.block_people }
  }

  [ err, res ] = await To(UserNotification.find({ query, select: { _id: 1} }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  let ids:Array<string> = [];
  if (res && res.length > 0) res.map((item: any)=>ids.push(item._id));

  return { ids }
}

const updateUserNotifaction = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args
  let options = {}, err, result, query, update;
  // let { error, query, update } = Updates({ args, model: 'user-notification', role });

  [ err, query ] = getQuery({ args, model: Model.updateUserNotifaction, role });
  [ err, update ] = getSave({ args, model: Model.updateUserNotifaction, role });

  // [ err, query ] = getUpdateQuery({ args, model: 'user-notification', role });
  // [ err, update ] = getUpdateContent({ args, model: 'user-notification', role });

  if (err) {
    throw CreateError({
      message: err,
      data: {}
    })
  }

  //===

  [ err, result ] = await To(UserNotification.update({ query, update, options }))

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}


export const query = { userNotifications, countUserNotifications, fetchUnreadUserNotification }
export const mutation = { updateUserNotifaction }

// export { query, mutation, resolvers }


/*

// 删除数据中重复的通知
UserNotification.find({ query: {},  }).then(res=>{

  let exist = [];
  let noExsit = [];
  res.map(item=>{
    if (exist.indexOf(`${item.type}-${item.sender_id}-${item.addressee_id}-${item.posts_id || ''}-${item.comment_id || ''}`) != -1) {
      noExsit.push(item._id);
    } else {
      exist.push(`${item.type}-${item.sender_id}-${item.addressee_id}-${item.posts_id || ''}-${item.comment_id || ''}`)
    }
  });

  console.log(noExsit);

  if (noExsit.length > 0) {

    UserNotification.remove({
      query: { _id: { $in: noExsit } }
    }).then(res=>{
      console.log('删除完成');
    })

  }

});
*/
