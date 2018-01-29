import Posts from '../../modelsa/posts'
import User from '../../modelsa/user'

import { FooError } from './errors'

// import isJSON from 'is-json'

// import _posts from '../../api/v2/params-white-list/posts'
// import _checkParams from '../../api/v2/params-white-list'
//

//
// const checkParams = (dataJSON) => {
//   return _checkParams(dataJSON, _posts)
// }

import Querys from '../querys'



let query = {}
let mutation = {}
let resolvers = {
  Posts: {
    async user_id(posts) {

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


query.posts = async (root, args, context) => {

  // console.log(root);
  // console.log(args);
  // console.log(context._extensionStack.extensions[0].resolverCalls[0].returnType);

  // console.log(args);

  // const { query, options } = Querys(args, 'posts')

  // console.log(args);

  // console.log(root);
  // console.log('1111');
  // console.log(args);

  // 判断是否需要登陆权限
  // console.log(context);

  // return null

  // throw new FooError({
  //   data: {
  //     something: 'important'
  //   }
  // });

  // console.log('1111');

  let { _id, topic_id, user_id, lte_create_at, gte_create_at, weaken, recommend, deleted, sort, skip = 0, limit = 300 } = args

  let query = {},
    options = { skip, limit }

    // console.log(args);

  if (_id) query._id = _id
  if (topic_id) query.topic_id = topic_id
  if (user_id) query.user_id = user_id
  if (lte_create_at) query.create_at = { '$lte': lte_create_at }
  if (gte_create_at) query.gte_create_at = { 'gte': gte_create_at }
  if (weaken) query.weaken = weaken
  if (recommend) query.recommend = recommend
  if (deleted) query.deleted = deleted
  if (sort) query.sort = sort


  options.populate = [
    {
      path: 'user_id',
      // select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
    },
    {
      path: 'comment',
      match: {
        $or: [
          { deleted: false, weaken: false, like_count: { $gte: 2 } },
          { deleted: false, weaken: false, reply_count: { $gte: 1 } }
        ]
      },
      // select: {
      //   '_id': 1, 'content_html': 1, 'create_at': 1, 'reply_count': 1, 'like_count': 1, 'user_id': 1, 'posts_id': 1
      // },
      // options: { limit: 1 }
    },
    {
      path: 'topic_id',
      // select: { '_id': 1, 'name': 1 }
    }
  ]

  let postList = await Posts.find({
    query,
    options
  })

  return postList

}

mutation.addPosts = (root) => {

  return { success: true, error: 10000 }

  return 'ok'
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
