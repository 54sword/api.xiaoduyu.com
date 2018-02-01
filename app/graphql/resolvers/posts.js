import Posts from '../../modelsa/posts'
import User from '../../modelsa/user'

import CreateError from './errors'
import To from '../../common/to'

import Querys from '../querys'
import Updates from '../updates'

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

  const { user, role } = context

  let select = {}
  schema.fieldNodes[0].selectionSet.selections.map(item=>{
    select[item.name.value] = 1
  })

  let { query, options } = Querys(args, 'posts')

  // console.log(query);
  // console.log(options);

  // console.log(select);

  if (!options.populate) options.populate = []

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
        '_id': 1, 'content_html': 1, 'create_at': 1, 'reply_count': 1, 'like_count': 1, 'user_id': 1, 'posts_id': 1
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

  // console.log(options);

  let postList = await Posts.find({ query, select, options })

  // console.log(postList);

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
