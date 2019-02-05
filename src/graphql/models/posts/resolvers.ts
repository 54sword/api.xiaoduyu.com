import { Posts, User, Follow, Like, Topic, Feed, Phone } from '../../../models';

import CreateError from '../../common/errors';
import To from '../../../utils/to';

// import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../../config';
import xss from 'xss';

// let [ query, mutation, resolvers ] = [{},{},{}];

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'

import { emit } from '../../../socket'

// 查询
const posts = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let select: any = {}, err, postList: any, followList, likeList, ids, query, options;


  [ err, query ] = getQuery({ args, model: Model.posts, role });
  [ err, options ] = getOption({ args, model: Model.posts, role });


  // [ err, query ] = getQuery({ args, model:'posts', role });
  // [ err, options ] = getOption({ args, model:'posts', role });

  // 未登陆用户，不能使用method方式查询
  if (!user && method) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // 每页数量
  let limit = options.limit;

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item:any)=>select[item.name.value] = 1);

  // 用户隐私信息，仅对管理员可以返回
  if (!role || role != 'admin') {
    if (select.ip) delete select.ip;
  }

  if (!options.populate) options.populate = []

  // 增加屏蔽条件
  // 1、如果是登陆状态，那么增加屏蔽条件
  // 2、如果通过posts id查询，那么不增加屏蔽条件

  if (user) {

    if (!query._id && user.block_posts_count > 0) {
      query._id = { '$nin': user.block_posts }
    }

    if (!query.user_id && user.block_people_count > 0) {
      query.user_id = { '$nin': user.block_people }
    }

  }

  if (user && method == 'subscribe') {

    if (user.follow_posts.length == 0 && user.block_posts.length == 0) {
      return [];
    }

    // 用户订阅的帖子
    query._id = {
      '$in': user.follow_posts,
      // 过滤屏蔽的帖子
      '$nin': user.block_posts
    }

  }

  if (select.user_id) {
    options.populate.push({
      path: 'user_id',
      justOne: true
      // select: {
      //   '_id': 1,
      //   'avatar': 1,
      //   'nickname': 1,
      //   'brief': 1,
      //   posts_count: 1,
      //   comment_count: 1,
      //   fans_count: 1,
      //   follow_people_count: 1,
      //   follow_topic_count: 1,
      //   follow_posts_count: 1,
      //   block_people_count: 1,
      //   block_posts_count: 1
      // }
    })
  }

  if (select.comment) {
    options.populate.push({
      path: 'comment',
      match: {
        deleted: false,
        weaken: false
        /*
        $or: [
          { deleted: false, weaken: false, like_count: { $gte: 2 } },
          { deleted: false, weaken: false, reply_count: { $gte: 1 } }
        ]
        */
      },
      select: {
        '_id': 1, 'content_html': 1, 'create_at': 1, 'reply_count': 1,
        'like_count': 1, 'user_id': 1, 'posts_id': 1
      },
      options: { limit: 5, sort: { create_at: -1 } }
    })
  }

  if (select.topic_id) {
    options.populate.push({
      path: 'topic_id',
      select: { '_id': 1, 'name': 1, 'avatar':1 },
      justOne: true
    })
  }

  if (query['$or'] && query['$or'].length == 0) {
    postList = [];
  } else {
    [ err, postList = [] ] = await To(Posts.find({ query, select, options }));
  }

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  // console.log(select.comment);

  if (select.comment && postList.length > 0) {

    options = [
      {
        path: 'comment.user_id',
        model: 'User',
        select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 },
        justOne: true
      }
    ];

    [ err, postList ] = await To(Posts.populate({ collections: postList, options }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

  }

  // 如果未登陆，直接返回
  if (!user || postList.length == 0) return postList;

  let peopleIds:Array<string> = [], postsIds:Array<string> = [];

  postList.map((item: any)=>{

    postsIds.push(item._id);

    if (!item.user_id || !item.user_id._id) return;

    if (peopleIds.indexOf(item.user_id._id) == -1) {
      peopleIds.push(item.user_id._id);
    }

  });

  let promises:any = [
    // 关注用户
    Follow.find({
      query: { user_id: user._id, people_id: { "$in": peopleIds }, deleted: false },
      select: { _id: 0, people_id: 1 }
    }),
    // 关注帖子
    Follow.find({
      query: { user_id: user._id, posts_id: { "$in": postsIds }, deleted: false },
      select: { _id: 0, posts_id: 1 }
    }),
    // 赞的帖子
    Like.find({
      query: { user_id: user._id, type: 'posts', target_id: { "$in": postsIds }, deleted: false },
      select: { _id: 0, target_id: 1 }
    })
  ];

  if (method == 'user_follow' && limit != 1) {
    promises.push([
      User.update({
        query: { _id: user._id },
        update: { last_find_posts_at: new Date() }
      })
    ]);
  } else if (method == 'subscribe' && limit != 1) {
    promises.push([
      User.update({
        query: { _id: user._id },
        update: { last_find_subscribe_at: new Date() }
      })
    ]);
  } else if (query.recommend && limit != 1) {
    promises.push([
      User.update({
        query: { _id: user._id },
        update: { last_find_excellent_at: new Date() }
      })
    ]);
  }

  return Promise.all(promises).then(([ followPeopleList, followPostsList, likePostsList ]: any)=>{

    let ids: any = {};

    followPeopleList.map((item: any)=>{ ids[item.people_id] = 1; });
    followPeopleList = ids;

    ids = {};

    followPostsList.map((item: any)=>{ ids[item.posts_id] = 1; });
    followPostsList = ids;

    ids = {};

    likePostsList.map((item: any)=>{ ids[item.target_id] = 1; });
    likePostsList = ids;
    
    postList.map((item: any) => {
      
      item.follow = followPostsList[item._id] ? true : false;
      item.like = likePostsList[item._id] ? true : false;

      if (item.user_id) {
        item.user_id.follow = followPeopleList[item.user_id._id] ? true : false;
      }
    });

    return postList;
  });

}


// 获取累计数
const countPosts = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  // let select = {}, err, count, query;

  let [select, err, count, query]: any = [{}, null, null, null];

  // let { query } = Querys({ args, model:'posts', role });

  // [ err, query ] = getQuery({ args, model:'posts', role });

  [ err, query ] = getQuery({ args, model: Model.posts, role });
  // [ err, options ] = getOption({ args, model: Model.posts, role });


  if (err) {
    throw CreateError({ message: err })
  }

  // 未登陆用户，不能使用method方式查询
  if (!user && method) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item:any)=>select[item.name.value] = 1);

  /**
   * 增加屏蔽条件
   *
   * 如果是登陆状态，那么增加屏蔽条件
   * 如果通过posts查询，那么不增加屏蔽条件
   */
   if (user) {

     if (!query._id && user.block_posts_count > 0) {
       query._id = { '$nin': user.block_posts }
     }

     if (!query.user_id && user.block_people_count > 0) {
       query.user_id = { '$nin': user.block_people }
     }

   }

   if (user && method == 'subscribe') {

    if (user.follow_posts.length == 0 && user.block_posts.length == 0) {
      return [];
    }

    // 用户订阅的帖子
    query._id = {
      '$in': user.follow_posts,
      // 过滤屏蔽的帖子
      '$nin': user.block_posts
    }

  }

  /*
  // 用户关注
  if (user && method == 'user_follow') {

    let newQuery = { '$or': [] }

    if (query.user_id) delete query.user_id;
    if (query.topic_id) delete query.topic_id;
    if (query.posts_id) delete query.posts_id;
    if (query._id) delete query._id;

    newQuery['$or'].push(Object.assign({}, query, {
      user_id: user._id,
      deleted: false
    }, {}));

    // 用户
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

    // 话题
    if (user.follow_topic.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        topic_id: {'$in': user.follow_topic },
        deleted: false,
        weaken: false
      }, {}))
    }

    // 帖子
    if (user.follow_posts.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        posts_id: {
          '$in': user.follow_posts,
          // 过滤屏蔽的帖子
          '$nin': user.block_posts
        },
        deleted: false
      }, {}))
    }

    query = newQuery;
  }
  */

  [ err, count ] = await To(Posts.count({ query }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  return {
    count
  }
}

function Countdown(nowDate: (string|number), endDate: (string|number)) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)
  var timeCount = lastDate - now
  var days = parseInt( (timeCount / (3600*24))+'' )
  var hours = parseInt( ((timeCount - (3600*24*days)) / 3600)+'' )
  var mintues = parseInt( ((timeCount - (3600*24*days) - (hours*3600)) / 60) + '' )
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}

const addPosts = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip  } = context;
  let err, // 错误
      result, // 结果
      fields; // 字段

  if (!user) throw CreateError({ message: '请求被拒绝' });

  // [ err, fields ] = getSaveFields({ args, model:'posts', role });

  [ err, fields ] = getSave({ args, model: Model.addPosts, role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { title, content, content_html, topic_id, device_id = 1, type = 1 } = fields;

  if (!ip) throw CreateError({ message: '无效的ip' });
  if (type > 1) throw CreateError({ message: 'type 无效' });

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

  // phone
  [ err, result ] = await To(Phone.findOne({
    query: { user_id: user._id }
  }));

  if (!result) {

    // 一天仅能发布一次
    let date = new Date();
    [ err, result ] = await To(Posts.findOne({
      query: {
        user_id: user._id,
        create_at: {
          '$gte': new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        }
      }
    }));

    if (err) {
      throw CreateError({
        message: '添加失败',
        data: { errorInfo: err.message }
      })
    }

    if (result) {
      throw CreateError({
        message: '一天仅能发布一次帖子，绑定手机号后解除限制'
      })
    }
    
  }

  // title
  title = xss(title, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: (tag: any, name: any, value: any, isWhiteAttr: any) => ''
  })

  if (!title || title.replace(/(^\s*)|(\s*$)/g, "") == '') {
    throw CreateError({ message: '标题不能为空' });
  } else if (title.length > 120) {
    throw CreateError({ message: '标题不能大于120个字符' });
  }

  // content
  // content = xss(content, {
  //   whiteList: {},
  //   stripIgnoreTag: true,
  //   onTagAttr: (tag, name, value, isWhiteAttr) => ''
  // });
  
  content_html = xss(content_html, {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt'],
      p: [], div: [], br: [], blockquote: [], li: [], ol: [], ul: [],
      strong: [], em: [], u: [], pre: [], b: [], h1: [], h2: [], h3: [],
      h4: [], h5: [], h6: [], h7: [], video: []
    },
    stripIgnoreTag: true,
    onIgnoreTagAttr: function (tag: any, name: any, value: any, isWhiteAttr: any) {
      if (tag == 'div' && name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    }
  });

  // topic
  [ err, result ] = await To(Topic.findOne({
    query: { _id: topic_id }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  if (!result) {
    throw CreateError({
      message: 'topic_id 不存在'
    })
  }

  // 储存
  [ err, result ] = await To(Posts.save({
    data: {
      user_id: user._id,
      title,
      content,
      content_html,
      topic_id,
      ip,
      device: device_id,
      type,
      last_comment_at: new Date().getTime()
    }
  }));

  // 添加到feed
  Feed.save({
    data: {
      user_id: user._id,
      posts_id: result._id
    }
  });

  // 更新
  await To(Topic.update({
    query: { _id: topic_id },
    update: { $inc: { 'posts_count': 1 } }
  }));

  await To(User.update({
    query: { _id: user._id },
    update: { $inc: { 'posts_count': 1 } }
  }));

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    })
  }

  return {
    success: true,
    _id: result._id
  }
}


// 更新
const updatePosts = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  // 必须登陆用户才有权限
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let [err, query, content, result]:any = [];

  // 获取查询条件
  [ err, query ] = getQuery({ args, model: Model.updatePosts, role });
  // [ err, query ] = getUpdateQuery({ args, model:'posts', role });
  if (err) throw CreateError({ message: err });

  // 获取更新内容
  // [ err, content ] = getUpdateContent({ args, model:'posts', role });
  [ err, content ] = getSave({ args, model: Model.updatePosts, role });
  if (err) throw CreateError({ message: err });

  // 判断帖子是否存在
  [ err, result ] = await To(Posts.findOne({ query }));
  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!result) throw CreateError({ message: '帖子不存在' });

  // 是否有权限修改
  if (role != 'admin' && user._id + '' != result.user_id + '') {
    throw CreateError({ message: '无权修改' });
  }

  if (role != 'admin') {
    // 帖子超过48小时，则不能被修改
    if (new Date().getTime() - new Date(result.create_at).getTime() > 1000*60*60*24) {
      throw CreateError({ message: '帖子超过24小时后，不能被修改' });
    }
  }
  
  content.update_at = new Date();

  // 更新
  [ err, result ] = await To(Posts.update({ query, update: content }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    });
  }

  if (Reflect.has(content, 'deleted')) {

    // 更新feed中相关posts的delete状态
    let err, feedList;

    [ err, feedList ] = await To(Feed.find({
      query: { posts_id: query._id }
    }));

    let ids: any = [];

    feedList.map((feed:any)=>ids.push(feed._id));

    [ err ] = await To(Feed.update({
      query: { _id: { '$in': ids } },
      update: { deleted: content.deleted },
      options: { multi: true }
    }));

    if (err) {
      throw CreateError({
        message: 'Feed 更新失败',
        data: { errorInfo: err.message }
      });
    }

  }

  if (Reflect.has(content, 'recommend')) {
    emit('member', { type: 'recommend-posts' });
  }

  return { success: true }
}


const viewPosts = async (root:any, args: any, context: any, schema: any) => {

  const { posts_id } = args;

  let query = {
    _id: posts_id
  }

  let [ err, result ] = await To(Posts.update({
    query,
    update: { $inc: { view_count: 1 } }
  }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    });

    return { success: false }
  }

  return {
    success: true
  }
}

export const query = { posts, countPosts }
export const mutation = { addPosts, updatePosts, viewPosts }

// export { query, mutation, resolvers }