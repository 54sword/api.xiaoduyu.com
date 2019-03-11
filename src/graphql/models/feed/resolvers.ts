
import { Feed, Follow, Like, User } from '../../../models';
import To from '../../../utils/to';
import CreateError from '../../common/errors';

import * as Model from './arguments'
import { getQuery, getOption } from '../tools'

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


const feed = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;
  let err, query: any, options: any, select = {}, list: any, followList;

  // 请求用户的角色
  let admin = role == 'admin' ? true : false;

  [ err, query ] = getQuery({ args, model:Model.feed, role });
  [ err, options ] = getOption({ args, model:Model.feed, role });


  // if (!options.limit || options.limit > 50) {
  //   options.limit = 50
  // }

  let limit = options.limit;

  // 偏好模式（用户关注），如果用户未登陆，则拒绝请求
  if (args.preference && !user) {
    throw CreateError({ message: '请求被拒绝，用户未登陆' });
  }

  if (args.preference && user) {

    let _query: any = { '$or': [] };

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
        user_id: { '$nin': user.block_people },
        topic_id: {'$in': user.follow_topic },
        posts_id: { '$nin': user.block_posts },
        deleted: false
      }, {}));
    }

    query = _query;
  }

  options.populate = [
    { path: 'user_id', select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }, justOne: true },
    { path: 'comment_id', match: { weaken: false, deleted: false }, justOne: true },
    { path: 'posts_id', match: { weaken: false, deleted: false }, justOne: true }
  ];

  [ err, list ] = await To(Feed.find({ query, select: {}, options }));

  if (!list || list.length == 0) {

    // 更新用户最后一次查询feed日期
    if (!query.user_id && user && limit != 1) {
      updateLastFindFeedDate(user._id);
    }

    return [];
  }

  options = [
    { path: 'comment_id.reply_id', model: 'Comment', match: { 'deleted': false }, justOne: true },
    { path: 'posts_id.user_id', model: 'User', justOne: true },
    { path: 'posts_id.topic_id', model: 'Topic', select: { '_id': 1, 'name': 1, 'avatar':1 }, justOne: true }
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

  // if (!list) return [];

  // 未登陆的用户，直接返回
  if (!user) return list;

  // 获取follow和like

  let postsIds:Array<string> = [], commentIds:Array<string> = [];

  list.map((item: any)=>{
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
  ]).then(async (values: any) => {

    let followPosts: any,
          likePosts: any,
          likeComment: any;

    [ followPosts, likePosts, likeComment ] = values;

    let ids: any = {};

    followPosts.map((item: any)=>ids[item.posts_id] = 1);

    list.map((item: any)=>{
      if (item.posts_id && item.posts_id._id && ids[item.posts_id._id]) {
        item.posts_id.follow = true;
      }
    });

    ids = {};

    likePosts.map((item: any)=>ids[item.target_id] = 1);

    list.map((item: any)=>{
      if (item.posts_id && item.posts_id._id && ids[item.posts_id._id]) {
        item.posts_id.like = true;
      }
    });

    ids = {};

    likeComment.map((item: any)=>ids[item.target_id] = 1);

    list.map((item: any)=>{
      if (item.comment_id && item.comment_id._id && ids[item.comment_id._id]) {
        item.comment_id.like = true;
      }
    });

    // 更新用户最后一次查询feed日期
    if (!query.user_id && user && limit != 1 && list && list.length > 0) {
      updateLastFindFeedDate(user._id);
    }

    return list;

  });

}

const countFeed = async (root: any, args: any, context: any, schema:any) => {

  const { user, role } = context;
  let err, query, options, select = {}, count;

  [ err, query ] = getQuery({ args, model:Model.feed, role });
  [ err, options ] = getOption({ args, model:Model.feed, role });

  // 偏好模式（用户关注），如果用户未登陆，则拒绝请求
  if (args.preference && !user) {
    throw CreateError({ message: '请求被拒绝，用户未登陆' });
  }

  if (args.preference && user) {

    let _query: any = { '$or': [] };

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
        user_id: { '$nin': user.block_people },
        topic_id: {'$in': user.follow_topic },
        posts_id: { '$nin': user.block_posts },
        deleted: false
      }, {}));
    }
    
    query = _query;
  };

  [ err, count ] = await To(Feed.count({ query }));

  return {
    count
  }

}

// 更新用户最后一次查询feed的日期
const updateLastFindFeedDate = (userId: string) => {
  User.update({
    query: { _id: userId },
    update: { last_find_feed_at: new Date() }
  });
}

export const query = { feed, countFeed }
export const mutation = {}
