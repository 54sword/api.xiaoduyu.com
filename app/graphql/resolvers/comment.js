import { Comment, Like, Posts, User, UserNotification } from '../../modelsa';
import xss from 'xss';

import To from '../../common/to';
import CreateError from './errors';
import Querys from '../querys';
import Updates from '../updates';

let [ query, mutation, resolvers ] = [{},{},{}];

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';

query.comments = async (root, args, context, schema) => {

  const { user, role, ip } = context
  let select = {}, query, options, err, commentList = [], likeList = [];
  // let { query, options } = Querys({ args, model: 'comment', role })

  [ err, query ] = getQuery({ args, model: 'comment', role });
  [ err, options ] = getOption({ args, model: 'comment', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===

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

  /*
  if (Reflect.has(select, 'posts_id') && select.posts_id) {
    options.populate.push([
      { path: 'posts_id', select: { _id:1, title:1, content_html:1 } }
    ])
  }
  */

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

  [ err, commentList ] = await To(Comment.find({ query, select, options }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

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
    [ err, commentList ] = await To(Comment.populate({ collections: commentList, options }))
  }

  options = [];

  if (Reflect.has(select, 'reply') && select.reply) {
    options.push({
      path: 'reply.reply_id.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
    })
  }

  if (options.length > 0) {
    [ err, commentList ] = await To(Comment.populate({ collections: commentList, options }))
  }

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }


  // 如果未登录，那么直接返回结果
  if (!user || !select.like || Reflect.has(select, 'like') && !select.like) {
    return commentList
  }

  // 查询是否点赞了评论或回复

  commentList = JSON.stringify(commentList);
  commentList = JSON.parse(commentList);

  var ids = [];

  commentList.map(function(item){
    ids.push(item._id)
    if (item.reply) item.reply.map(item => ids.push(item._id))
  });

  [ err, likeList ] = await To(Like.find({
    query: {
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
    },
    select: { target_id: 1, _id: 0 }
  }))

  ids = {}

  likeList.map(function(item){
    ids[item.target_id] = 1
  })

  commentList.map(function(item){
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

  return commentList
}


query.countComments = async (root, args, context, schema) => {

  const { role } = context;
  let err, query, count;

  [ err, query ] = getQuery({ args, model: 'comment', role });
  [ err, count ] = await To(Comment.count({ query }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  return { count }
}


mutation.updateComment = async (root, args, context, schema) => {

  const { role, user } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, query, update, result;

  [ err, query ] = getUpdateQuery({ args, model: 'comment', role });
  if (err) throw CreateError({ message: err });

  [ err, update ] = getUpdateContent({ args, model: 'comment', role });
  if (err) throw CreateError({ message: err });

  [ err, result ] = await To(Comment.update({ query, update }))
  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}


mutation.addComment = async (root, args, context, schema) => {

  const { user, role, ip  } = context;
  let err, // 错误
      result, // 结果
      fields,
      posts,
      comment,
      parentComment,
      reply; // 字段

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSaveFields({ args, model:'comment', role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { posts_id, reply_id, parent_id, content, content_html, topic_id, device = 1 } = fields;

  if (!ip) throw CreateError({ message: '无效的ip地址' });

  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date(), user.banned_to_post);
    throw CreateError({
      message: '禁言中',
      data: { error_data: err.countdown }
    });
  }

  // posts_id
  if (posts_id) {
    [ err, posts ] = await To(Posts.findOne({
      query: { _id: posts_id }
    }));

    if (err) {
      throw CreateError({ message: '查询失败', data: { errorInfo: err.message } })
    }

    if (!posts) {
      throw CreateError({
        message: 'posts_id 不存在'
      })
    }

  }

  // parent_id
  if (parent_id) {

    [ err, parentComment ] = await To(Comment.findOne({
      query: { _id: parent_id }
    }));

    if (err) {
      throw CreateError({ message: '查询失败', data: { errorInfo: err.message } })
    }

    if (!parentComment) {
      throw CreateError({
        message: 'parent_id 不存在'
      })
    }

    // console.log(parentComment);

    if (parentComment.posts_id + '' != posts_id) {
      throw CreateError({
        message: 'parent_id 不属于 posts_id 的评论'
      })
    }

  }

  // reply_id
  if (reply_id) {
    [ err, reply ] = await To(Comment.findOne({
      query: { _id: reply_id }
    }));

    if (err) {
      throw CreateError({ message: '查询失败', data: { errorInfo: err.message } })
    }
  }

  // content and conrent_html
  content = xss(content, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: (tag, name, value, isWhiteAttr) => ''
  });

  content_html = xss(content_html, {
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

  let _contentHTML = content_html
  _contentHTML = _contentHTML.replace(/<img[^>]+>/g,"1")
  _contentHTML = _contentHTML.replace(/<[^>]+>/g,"")

  if (!content || !content_html || _contentHTML == '') {
    throw CreateError({
      message: '内容不能为空'
    })
  }


  // 储存
  let data = {
    user_id: user._id,
    content,
    content_html,
    posts_id,
    ip,
    device
  }

  // 评论的回复
  if (parent_id) data.parent_id = parent_id;
  // 评论的回复的回复
  if (parent_id && reply_id) data.reply_id = reply_id;

  [ err, result ] = await To(Comment.save({ data }));

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    })
  }

  // ==================================
  // 评论相关更新与通知
  if (posts_id && !parent_id && !reply_id) {

    updatePostsCommentCount(posts_id);
    updateUserCommentCount(user._id);

    /*
    let count;
    [ err, count ] = await To(Comment.count({
      query: {
        posts_id: posts_id,
        parent_id: { $exists: false },
        deleted: false
      }
    }));

    // 更新评论通知
    let update = {
      comment_count: count,
      $addToSet: { comment: result._id }
    }

    // 如果帖子创建日期，小于30天，置顶帖子
    if (new Date().getTime() - new Date(posts.create_at).getTime() < 1000 * 60 * 60 * 24 * 30) {
      update.sort_by_date = new Date();
    }

    await To(Posts.update({
      query: { _id: posts_id },
      update
    }));


    await To(User.update({
      query: { _id: user._id },
      update: { $inc: { comment_count: 1 } }
    }));
    */

    if (user._id + '' != posts.user_id + '') {
      // 发送通知邮件给帖子作者
      await To(UserNotification.save({
        data: {
          type: 'comment',
          sender_id: user._id,
          addressee_id: posts.user_id,
          comment_id: result._id
        }
      }));
      // 极光推送
      // jpush.pushCommentToUser({ comment, posts, user })
    }

  }

  // 回复累计更新以及通知
  if (posts_id && parent_id) {

    // 更新累计数
    // await To(Comment.update({
    //   query: { _id: parent_id },
    //   update: { '$addToSet': { 'reply': result._id }, $inc: { 'reply_count': 1 } }
    // }));

    updateCommentReplyCount(parent_id, posts_id);

    // 发送通知
    if (reply.user_id + '' != user._id + '') {
      await To(UserNotification.add({
        type: 'reply',
        sender_id: user._id,
        addressee_id: reply_id ? reply.user_id : parentComment.user_id,
        comment_id: result._id,
      }));
    }

    // jpush.pushReplyToUser({ comment: parentComment, reply: comment, user })
  }

  return {
    success: true,
    _id: result._id
  }
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
async function updatePostsCommentCount(posts_id) {

  let [ err, result ] = await To(Comment.find({
    query: {
      posts_id,
      parent_id: { $exists: false },
      deleted: false
    },
    select: { _id: 1 }
  }));

  var ids = [];
  result.map(item =>{ ids.push(item._id) });

  // 更新评论通知
  let update = {
    comment_count: ids.length,
    commenr: ids
  }

  // 如果帖子创建日期，小于30天，置顶帖子
  // if (new Date().getTime() - new Date(posts.create_at).getTime() < 1000 * 60 * 60 * 24 * 30) {
  //   update.sort_by_date = new Date();
  // }

  await To(Posts.update({ query: { _id: posts_id }, update }));

};

// 更新帖子的评论数量，以及评论id
async function updateUserCommentCount(user_id) {

  let [ err, total ] = await To(Comment.count({
    query: { user_id: user_id, deleted: false, parent_id: { $exists: false } }
  }));

  await To(User.update({
    query: { _id: user_id },
    update: { comment_count: total }
  }));

};


// 更新帖子的评论数量，以及评论id
async function updateCommentReplyCount(comment_id, posts_id) {

  let [ err, result ] = await To(Comment.find({
    query: {
      posts_id,
      parent_id: { $exists: true },
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

};
