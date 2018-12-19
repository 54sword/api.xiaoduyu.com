
import { Feed, Posts, Comment, Follow, Like, User } from '../../modelsa';
// import { domain } from '../../../config';

let query = {};
let mutation = {};
let resolvers = {};

import To from '../../common/to';
import CreateError from './errors';

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';

/*
Posts.find({
  query: {}
}).then(result=>{
  // console.log(res);
  // console.log(res);

  result.map(item=>{
    Feed.save({
      data: {
        user_id: item.user_id,
        topic_id: item.topic_id,
        posts_id: item._id,
        create_at: item.create_at
      }
    })
  });

  console.log('posts 完成');

});


Comment.find({
  query: {}
}).then(result=>{
  // console.log(res);
  // console.log(res);

  result.map(item=>{
    Feed.save({
      data: {
        user_id: item.user_id,
        posts_id: item.posts_id,
        comment_id: item._id,
        create_at: item.create_at
      }
    })
  })

  console.log('comment 完成');

});
*/


query.feed = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, query, options, select = {}, list, followList;
  
  // 请求用户的角色
  let admin = role == 'admin' ? true : false;

  // console.log(args);

  [ err, query ] = getQuery({ args, model:'feed', role });
  [ err, options ] = getOption({ args, model:'feed', role });

  if (!options.limit || options.limit > 50) {
    options.limit = 50
  }

  let limit = options.limit;

  // 偏好模式（用户关注），如果用户未登陆，则拒绝请求    
  if (args.preference && !user) {
    throw CreateError({ message: '请求被拒绝，用户未登陆' });
  }

  if (args.preference && user) {

    let _query = { '$or': [] };

    // 获取与自己相关的帖子和评论
    /*
    _query['$or'].push(Object.assign({}, query, {
      user_id: user._id,
      posts_id: { '$nin': user.block_posts },
      deleted: false
    }));
    */
  
    // 关注的用户的评论与帖子
    if (user.follow_people.length > 0) {
      _query['$or'].push(Object.assign({}, query, {
        user_id: { '$in': user.follow_people, '$nin': user.block_people },
        posts_id: { '$nin': user.block_posts },
        deleted: false
      }, {}));
    }
  
    // 关注的话题的评论与帖子
    if (user.follow_topic.length > 0) {
      _query['$or'].push(Object.assign({}, query, {
        topic_id: {'$in': user.follow_topic },
        posts_id: { '$nin': user.block_posts },
        deleted: false
      }, {}));
    }
  
    query = _query;

    // console.log(query);

  }

  options.populate = [
    { path: 'user_id', select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 } },
    { path: 'comment_id' },
    { path: 'posts_id' }
  ];

  [ err, list ] = await To(Feed.find({ query, select: {}, options }));

  options = [
    { path: 'comment_id.reply_id', model: 'Comment', match: { 'deleted': false } },
    { path: 'posts_id.user_id', model: 'User' },
    { path: 'posts_id.topic_id', model: 'Topic', select: { '_id': 1, 'name': 1, 'avatar':1 } }
  ];

  [ err, list ] = await To(Feed.populate({ collections: list, options }));

  options = [
    {
      path: 'comment_id.reply_id.user_id',
      model: 'User',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 },
      match: { 'blocked': false }
    }
  ];

  [ err, list ] = await To(Feed.populate({ collections: list, options }));
  
  if (err) {
    throw CreateError({ message: err });
  }

  if (!list) return [];

  // 未登陆的用户，直接返回
  if (!user) return list;

  // 获取follow和like

  let postsIds = [], commentIds = [];

  list.map(item=>{
    if (item.posts_id && item.posts_id._id) postsIds.push(item.posts_id._id);
    if (item.comment_id && item.comment_id._id) commentIds.push(item.comment_id._id);

    // 如果reply的用户被blocked，那么则删除这条回复
    if (item.comment_id && item.comment_id.parent_id && item.comment_id.reply_id && !item.comment_id.reply_id.user_id) {
      item.comment_id.reply_id = null;
    }

  });

  return Promise.all([
    Follow.find({
      query: { user_id: user._id, posts_id: { "$in": postsIds }, deleted: false },
      select: { posts_id: 1 }
    }),
    Like.find({
      query: { user_id: user._id, type: 'posts', target_id: { "$in": postsIds }, deleted: false },
      select: { _id: 0, target_id: 1 }
    }),
    Like.find({
      query: { user_id: user._id, type: { "$in": ['reply','comment'] }, target_id: { "$in": commentIds }, deleted: false },
      select: { _id: 0, target_id: 1 }
    })
  ]).then(async values => {

    const [ followPosts, likePosts, likeComment ] = values;

    let ids = {};

    followPosts.map(item=>ids[item.posts_id] = 1);

    list.map(item=>{
      if (item.posts_id && item.posts_id._id && ids[item.posts_id._id]) {
        item.posts_id.follow = true;
      }
    });

    ids = {};

    likePosts.map(item=>ids[item.target_id] = 1);

    list.map(item=>{
      if (item.posts_id && item.posts_id._id && ids[item.posts_id._id]) {
        item.posts_id.like = true;
      }
    });

    ids = {};

    likeComment.map(item=>ids[item.target_id] = 1);

    list.map(item=>{
      if (item.comment_id && item.comment_id._id && ids[item.comment_id._id]) {
        item.comment_id.like = true;
      }
    });

    // 更新用户最后一次查询feed日期
    if (!query.user_id && user && limit != 1 && list && list.length > 0) {
      await User.update({
        query: { _id: user._id },
        update: { last_find_feed_at: new Date() }
      });
    }

    return list;

  });

}

query.countFeed = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, query, options, select = {}, count;

  [ err, query ] = getQuery({ args, model:'posts', role });
  [ err, options ] = getOption({ args, model:'posts', role });

  // 未登陆用户，不能使用method方式查询
  if (!user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  if (user.follow_people.length == 0 && user.follow_topic.length == 0) {
    return { count: 0 };
  }

  let _query = {
    '$or': []
  }

  // 用户
  if (user.follow_people.length > 0) {

    _query['$or'].push(Object.assign({}, query, {
      user_id: { '$in': user.follow_people, '$nin': user.block_people }
    }, {}));

  }

  // 话题
  if (user.follow_topic.length > 0) {
    _query['$or'].push(Object.assign({}, query, {
      topic_id: {'$in': user.follow_topic }
    }, {}));
  }

  query = _query;

  [ err, count ] = await To(Feed.count({ query }));

  return {
    count
  }

}

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
