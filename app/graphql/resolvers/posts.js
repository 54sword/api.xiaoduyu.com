import Posts from '../../modelsa/posts'
import User from '../../modelsa/user'
import Follow from '../../modelsa/follow'
import Like from '../../modelsa/like'

import CreateError from './errors'
import To from '../../common/to'

import Querys from '../querys'
import Updates from '../updates'

import merge from 'lodash/merge'


let query = {}
let mutation = {}
let resolvers = {
  Posts: {
    async user_id(posts, e, s, r) {

      // console.log(e);
      // console.log(r);

      // if (typeof posts.user_id == 'string') {
      //
      // }

      // console.log(typeof posts);

      // var options = [
      //   {
      //     model: 'User',
      //     path: 'user_id',
      //     select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
      //   }
      // ]
      //
      // let t = await User.populate({
      //   collections: posts,
      //   options,
      // })
      //
      // posts = t

      // console.log(t);

      // console.log(posts);
      // console.log('----');
      // return { _id: 1, name: 'Hello',brief: '2' };
    }
  }
}


query.posts = async (root, args, context, schema) => {

  const { user, role, method } = context

  let select = {}, err, postList, followList, likeList, ids
  let { query, options } = Querys(args, 'posts')

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  if (!options.populate) options.populate = []

  /**
   * 增加屏蔽条件
   *
   * 如果是登陆状态，那么增加屏蔽条件
   * 如果通过posts查询，那么不增加屏蔽条件
   */
  if (user && !query._id) {
    if (user.block_posts_count > 0) query._id = { '$nin': user.block_posts }
    if (user.block_people_count > 0) query.user_id = { '$nin': user.block_people }
  }

  // 用户关注
  if (user && method == 'user_follow') {

    let newQuery = { '$or': [] }

    if (query.user_id) delete query.user_id
    if (query.topic_id) delete query.topic_id
    if (query.posts_id) delete query.posts_id
    if (query._id) delete query._id

    // 用户
    if (user.follow_people.length > 0) {
      newQuery['$or'].push(merge(query, {
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
      newQuery['$or'].push(merge(query, {
        topic_id: {'$in': user.follow_topic },
        deleted: false
      }, {}))
    }

    // 帖子
    if (user.follow_posts.length > 0) {
      newQuery['$or'].push(merge(query, {
        posts_id: {
          '$in': user.follow_posts,
          // 过滤屏蔽的帖子
          '$nin': user.block_posts
        },
        deleted: false
      }, {}))
    }

  }

  if (select.user_id) {
    options.populate.push({
      path: 'user_id',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
    })
  }

  if (select.comment) {
    options.populate.push({
      path: 'comment',
      match: {
        $or: [
          { deleted: false, weaken: false, like_count: { $gte: 2 } },
          { deleted: false, weaken: false, reply_count: { $gte: 1 } }
        ]
      },
      select: {
        '_id': 1, 'content_html': 1, 'create_at': 1, 'reply_count': 1,
        'like_count': 1, 'user_id': 1, 'posts_id': 1
      },
      options: { limit: 1 }
    })
  }

  if (select.topic_id) {
    options.populate.push({
      path: 'topic_id',
      select: { '_id': 1, 'name': 1 }
    })
  }

  [ err, postList ] = await To(Posts.find({ query, select, options }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  if (select.comment) {

    options = [
      {
        path: 'comment.user_id',
        model: 'User',
        select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
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
  if (!user) return postList

  // find follow status
  ids = [];

  postList.map(item=>ids.push(item._id));

  [ err, followList ] = await To(Follow.find({
    query: { user_id: user._id, posts_id: { "$in": ids }, deleted: false },
    select: { posts_id: 1 }
  }));

  ids = {};

  followList.map(item=>ids[item.posts_id] = 1);
  postList.map(item => item.follow = ids[item._id] ? true : false);


  // find like status
  ids = [];

  postList.map(item=>ids.push(item._id));

  [ err, likeList ] = await To(Like.find({
    query: { user_id: user._id, type: 'posts', target_id: { "$in": ids }, deleted: false },
    select: { _id: 0, target_id: 1 }
  }));

  ids = {};
  
  likeList.map(item=>ids[item.posts_id] = 1);
  postList.map(item => item.like = ids[item._id] ? true : false);

  // 更新最近查询关注的帖子

  if (user && method == 'user_follow') {
    await User.update({
      query: { _id: user._id },
      update: { last_find_posts_at: new Date() }
    });
  }

  return postList
}

mutation.addPosts = (root) => {

  return { success: true, error: 10000 }

  return 'ok'
}

mutation.editPosts = async (root, args, context, schema) => {

  if (!context.user) {
    throw CreateError({ message: '请求被拒绝' })
  }

  let { query, update } = Updates(args, 'posts')

  let [ err, result ] = await To(Posts.update({ query, update }))

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
// exports.resolvers = resolvers
