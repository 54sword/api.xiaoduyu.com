import { Comment, Like, Posts, User, UserNotification, Feed, Message } from '../../models';
import xss from 'xss';

// import jpush from '../../common/jpush';
import To from '../../common/to';
import contentCheck from '../common/content-check';
import CreateError from '../common/errors';

let [ query, mutation, resolvers ] = [{},{},{}];

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';


mutation.addMessage = async (root, args, context, schema) => {

  const { user, role, ip  } = context;
  let err, // 错误
      result, // 结果
      fields; // 字段

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSaveFields({ args, model:'message', role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { addressee_id, content, content_html, device = 1 } = fields;

  if (!ip) throw CreateError({ message: '无效的ip地址' });

  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date(), user.banned_to_post);
    throw CreateError({
      message: '您被禁言，{days}天{hours}小时{mintues}分钟后解除禁言',
      data: { error_data: countdown }
    });
  };

  if (user._id + '' == addressee_id) {
    throw CreateError({ message: '不能发私信给自己' });
  };

  [ err, result ] = await To(User.findOne({ query: { _id: addressee_id } }));

  if (err || !result) {
    throw CreateError({ message: '收件人不存在' });
  }

  result = contentCheck(content_html);

  if (result) throw CreateError({ message: result });

  // 储存
  let data = {
    user_id: user._id,
    addressee_id,
    content,
    content_html,
    ip,
    device
  };

  [ err, result ] = await To(Message.save({ data }));
  
  if (err || !result) {
    throw CreateError({
      message: '添加失败',
      data: { errorInfo: err.message || '' }
    });
  }

  return {
    success: true,
    _id: result._id
  }
}


query.messages = async (root, args, context, schema) => {

  const { user, role, ip } = context;
  const { method } = args;
  let select = {}, query, options, err, messageList = [];

  [ err, query ] = getQuery({ args, model: 'message', role });
  [ err, options ] = getOption({ args, model: 'message', role });
  
  if (!user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  query.user_id = user._id;

  options.populate = [
    { path: 'user_id', select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 } },
    { path: 'addressee_id', select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 } }
  ];

  [ err, messageList ] = await To(Message.find({ query, select, options }));

  return messageList;
}


query.countMessages = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, query, count;

  [ err, query ] = getQuery({ args, model: 'comment', role });

  if (user) {

    if (!query._id && user.block_comment_count > 0) {
      query._id = { '$nin': user.block_comment }
    }

    if (!query.user_id && user.block_people_count > 0) {
      query.user_id = { '$nin': user.block_people }
    }

  }

  [ err, count ] = await To(Comment.count({ query }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  return { count }
}


mutation.updateMessage = async (root, args, context, schema) => {

  const { role, user } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, query, update, result, comment;

  [ err, query ] = getUpdateQuery({ args, model: 'comment', role });
  if (err) throw CreateError({ message: err });

  [ err, update ] = getUpdateContent({ args, model: 'comment', role });
  if (err) throw CreateError({ message: err });

  [ err, comment ] = await To(Comment.findOne({ query }));

  if (err || !comment) {
    throw CreateError({ message: '评论不存在' });
  }

  // 如果不是管理员，那么判断是否有权限编辑
  if (role != 'admin') {
    if (comment.user_id + '' != user._id + '') {
      throw CreateError({ message: '无权限编辑' });
    }
  }

  [ err, result ] = await To(Comment.update({ query, update }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  // 更新feed中相关comment的delete状态
  if (Reflect.has(update, 'deleted')) {
    
    if (!comment.parent_id) {
      // 评论
      updatePostsCommentCount(comment.posts_id);
      updateUserCommentCount(comment.user_id);
    } else if (comment.parent_id) {
      // 回复
      updateCommentReplyCount(comment.parent_id, comment.posts_id);
    }


    [ err ] = await To(Feed.update({
      query: { comment_id: query._id },
      update: { deleted: update.deleted }
    }));

    if (err) {
      throw CreateError({
        message: 'Feed 更新失败',
        data: { errorInfo: err.message }
      });
    }

  }

  return { success: true }
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

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;


// 更新帖子的评论数量，以及评论id
function updatePostsCommentCount(posts_id) {
  return new Promise(async resplve=>{

    let [ err, result ] = await To(Comment.find({
      query: {
        posts_id,
        parent_id: { $exists: false },
        deleted: false
      },
      select: { _id: 1, reply_count: 1 }
    }));

    var ids = [];
    let replyCount = 0;
    result.map(item =>{
      ids.push(item._id);
      replyCount += item.reply_count;
    });

    // 更新评论通知
    let update = {
      comment_count: ids.length,
      comment: ids,
      reply_count: replyCount
    }

    // 如果帖子创建日期，小于30天，置顶帖子
    // if (new Date().getTime() - new Date(posts.create_at).getTime() < 1000 * 60 * 60 * 24 * 30) {
      // update.sort_by_date = new Date();
    // }

    await To(Posts.update({ query: { _id: posts_id }, update }));

    resplve();

  });

};

// 更新帖子的评论数量，以及评论id
function updateUserCommentCount(user_id) {

  return new Promise(async resplve=>{

    let [ err, total ] = await To(Comment.count({
      query: { user_id: user_id, deleted: false, parent_id: { $exists: false } }
    }));

    await To(User.update({
      query: { _id: user_id },
      update: { comment_count: total }
    }));

    resplve();

  });

};


// 更新帖子的评论数量，以及评论id
function updateCommentReplyCount(comment_id, posts_id) {

  return new Promise(async resplve=>{

    let [ err, result ] = await To(Comment.find({
      query: {
        posts_id,
        parent_id: comment_id,
        deleted: false
      },
      select: { _id: 1 }
    }));

    var ids = [];
    result.map(item =>{ ids.push(item._id) });

    // 更新评论通知
    let update = {
      reply_count: ids.length,
      reply: ids
    }

    await To(Comment.update({ query: { _id: comment_id }, update }));

    resplve();

  });

};

/*
Posts.find({
  query: {},
  select: { _id:1 }
}).then(res=>{

  res.map(i=>{
    updatePostsCommentCount(i._id);
  });


  console.log('更新成功');
});
*/
