import Posts from '../../modelsa/posts'

// import isJSON from 'is-json'

import _posts from '../../api/v2/params-white-list/posts'
import _checkParams from '../../api/v2/params-white-list'

const checkParams = (dataJSON) => {
  return _checkParams(dataJSON, _posts)
}

exports.posts = async (root, args) => {

  console.log(args);

  // 检查参数是否合法
  // let json = checkParams(args.json)

  // 如果有非法参数，返回错误
  // if (Reflect.has(json, 'success') && Reflect.has(json, 'error')) {
  //   return res.send(json)
  // }
  //
  // let { query, options } = json

  let options = { limit: 30 }

  options.populate = [
    {
      path: 'user_id',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
    },
    {
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
    },
    {
      path: 'topic_id',
      select: { '_id': 1, 'name': 1 }
    }
  ]

  // return { error: 10000 }

  // console.log(query);
  // console.log(select);
  console.log(options);

  let postList = await Posts.find({
    options
  })

  return postList

}
