import { Comment, Like, Posts, User, UserNotification, Feed, Phone } from '../../../models';
import xss from 'xss';

import config from '../../../../config';
const { debug } = config;

// import * as jpush from '../../../common/jpush';
import To from '../../../utils/to';
import CreateError from '../../common/errors';
import * as alicloud from '../../../common/alicloud';

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'

const comments = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  const { method } = args
  let select: any = {}, query, options, err, commentList: any = [], likeList: any = [];

  [ err, query ] = getQuery({ args, model:Model.comments, role });
  [ err, options ] = getOption({ args, model:Model.comments, role });
  
  // 未登陆用户，不能使用method方式查询
  if (!user && method) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item: any)=>select[item.name.value] = 1)

  //===

  options.populate = [];

  // 用户关注
  if (user && method == 'user_follow') {

    let newQuery: any = { '$or': [] };

    // 获取自己的评论
    newQuery['$or'].push(Object.assign({}, query, {
      user_id: user._id,
      deleted: false
    }, {}));

    // 获取自己关注用户的评论
    if (user.follow_people.length > 0) {

      newQuery['$or'].push(Object.assign({}, query, {
        user_id: {
          '$in': user.follow_people,
          // 过滤屏蔽用户
          '$nin': user.block_people
        },
        deleted: false
      }, {}))
    }

    query = newQuery;
  }


  //======== 添加屏蔽条件

  if (!method) {

    if (Reflect.has(select, 'reply')) {

      // reply 添加屏蔽条件

      if (user && !query._id) {

        let match: any = {
          $or: [{
            deleted: false,
            weaken: false,
          }]
        }

        if (user.block_comment_count > 0) {
          match['$or'][0]._id = { '$nin': user.block_comment }
        }

        if (user.block_people_count > 0) {
          match['$or'][0].user_id = { '$nin': user.block_people }
        }
        options.populate.push({
          path: 'reply',
          // select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
          options: { limit: 3 },
          match
        });

      } else {
        options.populate.push({
          path: 'reply',
          // select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
          options: { limit: 3 },
          match: { deleted: false, weaken: false }
        });
      }

    }

    if (user) {

      if (!query._id && user.block_comment_count > 0) {
        query._id = { '$nin': user.block_comment }
      } else if (query._id && user.block_comment.indexOf(query._id) != -1) {
        return [];
      }

      if (!query.user_id && user.block_people_count > 0) {
        query.user_id = { '$nin': user.block_people }
      }

    }

  }

  //======== 添加屏蔽条件 end

  if (Reflect.has(select, 'user_id') && select.user_id) {
    options.populate.push([
      { path: 'user_id', select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }, justOne: true }
    ])
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.populate.push([
      { path: 'reply_id', select:{ 'user_id': 1, '_id': 0 }, justOne: true }
    ])
  }

  if (Reflect.has(select, 'posts_id') && select.posts_id) {
    options.populate.push([
      { path: 'posts_id', select: { _id:1, title:1, content_html:1 }, justOne: true }
    ])
  }

  /*
  if (role != 'admin') {
    // 增加一些默认的筛选条件
    if (!Reflect.has(query, 'deleted')) {
      query.deleted = false;
    }
  }
  */

  [ err, commentList ] = await To(Comment.find({ query, select, options }));

  if (err || !commentList) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  options = [];
  
  if (Reflect.has(select, 'reply') && select.reply) {

    options.push({
      path: 'reply.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 },
      justOne: true
    })
    options.push({
      path: 'reply.reply_id',
      model: 'Comment',
      select:{ '_id': 1, 'user_id': 1, 'content_html':1 },
      justOne: true
    })
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.push({
      path: 'reply_id.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 },
      justOne: true
    })
  }

  if (options.length > 0) {
    [ err, commentList ] = await To(Comment.populate({ collections: commentList, options }));
  }

  options = [];

  if (Reflect.has(select, 'reply') && select.reply) {
    options.push({
      path: 'reply.reply_id.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 },
      justOne: true
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

  var ids: any = [];

  commentList.map(function(item: any){
    ids.push(item._id)
    if (item.reply) item.reply.map((item: any) => ids.push(item._id))
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

  likeList.map(function(item: any){
    ids[item.target_id] = 1
  });

  commentList.map(function(item: any){
    if (ids[item._id]) {
      item.like = true
    } else {
      item.like = false
    }

    if (item.reply) {
      item.reply.map(function(item: any){
        if (ids[item._id]) {
          item.like = true
        } else {
          item.like = false
        }
      })
    }

    return item;
  });

  return commentList
}


const countComments = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;
  let err, query, count;

  [ err, query ] = getQuery({ args, model:Model.comments, role });

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


const updateComment = async (root: any, args: any, context: any, schema: any) => {

  const { role, user } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, query, update, result, comment;

  [ err, query ] = getQuery({ args, model:Model.updateComment, role });
  if (err) throw CreateError({ message: err });

  [ err, update ] = getSave({ args, model:Model.updateComment, role });
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

  if (role != 'admin') {
    // 帖子超过48小时，则不能被修改
    if (new Date().getTime() - new Date(comment.create_at).getTime() > 1000*60*60*1) {
      throw CreateError({ message: '评论或回复，超过1小时后，不能被修改' });
    }
  }

  update.update_at = new Date();

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


const addComment = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip  } = context;
  let err, // 错误
      result, // 结果
      fields,
      posts,
      comment,
      parentComment,
      reply; // 字段

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSave({ args, model: Model.addComment, role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { posts_id, reply_id, parent_id, content, content_html, topic_id, device = 1 } = fields;

  if (!ip) throw CreateError({ message: '无效的ip地址' });

  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date()+'', user.banned_to_post);
    throw CreateError({
      message: '您被禁言，{days}天{hours}小时{mintues}分钟后解除禁言',
      data: { error_data: countdown }
    });
  }


  // 正式环境开启限制
  if (!debug) {

    // phone
    [ err, result ] = await To(Phone.findOne({
      query: { user_id: user._id }
    }));

    if (!result) {

      // 一个用户只能评论一次
      if (posts_id && !parent_id && !reply_id) {

        [ err, result ] = await To(Comment.findOne({
          query: { user_id: user._id, posts_id, parent_id: { $exists : false } }
        }));
        
        if (result) {
          throw CreateError({
            message: '每个帖子仅能评论一次，绑定手机号后解除限制'
          });
        }
      }

    }

  }

  let _content_html = content_html || '';

  _content_html = _content_html.replace(/<[^>]+>/g,"");
  _content_html = _content_html.replace(/(^\s*)|(\s*$)/g, "");

  if (!content_html || !_content_html) {
    throw CreateError({
      message: '提交内容不能为空'
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
    onIgnoreTagAttr: function (tag: string, name: string, value: any, isWhiteAttr: any) {
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
  let data: any = {
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
    // 是否转发
    if (args.forward) {
      // 添加到feed
      Feed.save({
        data: {
          user_id: user._id,
          posts_id,
          comment_id: result._id
        }
      });
    }

    await updatePostsCommentCount(posts_id);
    await updateUserCommentCount(user._id);

    // 如果帖子创建日期，小于30天，置顶帖子
    if (new Date().getTime() - new Date(posts.create_at).getTime() < 1000 * 60 * 60 * 24 * 90) {

      await To(Posts.update({
        query: { _id: posts_id },
        update: {
          sort_by_date: new Date(),
          last_comment_at: result.create_at
        }
      }));

    } else {

      await To(Posts.update({
        query: { _id: posts_id },
        update: {
          last_comment_at: result.create_at
        }
      }));
      
    }

    if (user._id + '' != posts.user_id + '') {

      // 发送通知邮件给帖子作者
      await To(UserNotification.addOneAndSendNotification({
        data: {
          type: 'comment',
          sender_id: user._id,
          addressee_id: posts.user_id,
          comment_id: result._id
        }
      }));

      // 阿里云推送
      let commentContent = result.content_html.replace(/<[^>]+>/g,"");
      
      let titleIOS = user.nickname + ': ' + commentContent;
      if (titleIOS.length > 40) titleIOS = titleIOS.slice(0, 40) + '...';
      
      let body = commentContent;
      if (body.length > 40) body = body.slice(0, 40) + '...';

      alicloud.pushToAccount({
        userId: posts.user_id,
        title: user.nickname,
        body,
        summary: titleIOS,
        params: {
          routeName: 'Notifications', params: {}
        }
      });

      // 极光推送
      // jpush.pushCommentToUser({ comment: result, posts, user });
    }

  }
  
  // 回复累计更新以及通知
  if (posts_id && parent_id) {

    await updateCommentReplyCount(parent_id, posts_id);
    await updatePostsCommentCount(posts_id);

    // 发送通知
    if (reply.user_id + '' != user._id + '') {

      await To(UserNotification.addOneAndSendNotification({
        data: {
          type: 'reply',
          sender_id: user._id,
          addressee_id: reply_id ? reply.user_id : parentComment.user_id,
          comment_id: result._id
        }
      }));
      
      // 阿里云推送
      let commentContent = result.content_html.replace(/<[^>]+>/g,"");
      
      let titleIOS = user.nickname + ': ' + commentContent;
      if (titleIOS.length > 40) titleIOS = titleIOS.slice(0, 40) + '...';
      
      let body = commentContent;
      if (body.length > 40) body = body.slice(0, 40) + '...';

      alicloud.pushToAccount({
        userId: reply_id ? reply.user_id : parentComment.user_id,
        title: user.nickname,
        body,
        summary: titleIOS,
        params: {
          routeName: 'Notifications', params: {}
        }
      });

      // try {
        // 极光推送
        // jpush.pushReplyToUser({ comment: parentComment, reply: result, user });
      // } catch (err) {
        // console.log(err);
      // }

    }

  }

  return {
    success: true,
    _id: result._id
  }
}

export const query = { comments, countComments }
export const mutation = { addComment, updateComment }


function Countdown(nowDate: (string|number), endDate: (string|number)) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)
  var timeCount = lastDate - now
  var days = parseInt( (timeCount / (3600*24))+'' )
  var hours = parseInt( ((timeCount - (3600*24*days)) / 3600)+'' )
  var mintues = parseInt( ((timeCount - (3600*24*days) - (hours*3600)) / 60)+'' )
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}


// 更新帖子的评论数量，以及评论id
function updatePostsCommentCount(posts_id: string) {
  return new Promise(async resplve=>{

    let [ err, result ] = await To(Comment.find({
      query: {
        posts_id,
        parent_id: { $exists: false },
        deleted: false
      },
      select: { _id: 1, reply_count: 1 }
    }));

    var ids: any = [];
    let replyCount = 0;
    result.map((item: any) =>{
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
function updateUserCommentCount(user_id: string) {

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
function updateCommentReplyCount(comment_id: string, posts_id: string) {

  return new Promise(async resplve=>{

    let [ err, result ] = await To(Comment.find({
      query: {
        posts_id,
        parent_id: comment_id,
        deleted: false
      },
      select: { _id: 1 }
    }));

    var ids: any = [];
    result.map((item:any) =>{ ids.push(item._id) });

    // 更新评论通知
    let update = {
      reply_count: ids.length,
      reply: ids
    }

    await To(Comment.update({ query: { _id: comment_id }, update }));

    resplve();

  });

};

