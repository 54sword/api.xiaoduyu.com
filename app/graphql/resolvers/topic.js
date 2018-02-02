
import Topic from '../../modelsa/topic'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.topics = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys(args, 'topic')
  
  //===

  // 如果需要返回 parent_id，则获取 parent_id 的详细信息
  if (Reflect.has(select, 'parent_id')) {
    options.populate = [{
      path: 'parent_id',
      select: { '_id': 1, 'avatar': 1, 'name': 1 }
    }]
  }

  let [ err, topicList ] = await To(Topic.find({ query, select, options }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  // 如果是登陆用户，显示是否关注了该话题
  if (user && topicList && Reflect.has(select, 'follow')) {
    topicList = JSON.parse(JSON.stringify(topicList))
    topicList.map(node => {
      node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
    })
  }

  return topicList
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
