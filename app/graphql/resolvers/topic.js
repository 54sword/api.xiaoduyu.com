
import Topic from '../../modelsa/topic'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'
import Saves from '../saves'

query.topics = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys({ args, model: 'topic', role })

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

mutation.addTopic = async (root, args, context, schema) => {

  // console.log(context);

  const { user, role } = context;
  let { save } = Saves({ args, model: 'topic', role });
  let err, result;

  if (!user || role != 'admin') {
    throw CreateError({
      message: '无权限',
      data: {}
    });
  }

  if (!save.name || !save.description || !save.brief) {

    let message = '名字不能为空'

    if (!save.name) {
      message = '名字不能为空'
    } else if (!save.description) {
      message = '描述不能为空'
    } else if (!save.brief) {
      message = '简介不能为空'
    }

    throw CreateError({
      message,
      data: {}
    });
  };

  [ err, result ] = await To(Topic.findOne({ query: { name: save.name } }))

  if (err) {
    throw CreateError({
      message: '查询异常',
      data: { errorInfo: err.message }
    });
  }

  if (result) {
    throw CreateError({
      message: save.name+' 名称已存在',
      data: {}
    });
  }

  // 如果有父类，检查父类是否存在
  if (save.parent_id) {
    [ err, result ] = await To(Topic.findOne({ query: { _id: save.parent_id } }))

    if (err) {
      throw CreateError({
        message: '查询异常',
        data: { errorInfo: err.message }
      });
    }

    if (!result) {
      throw CreateError({
        message: save.parent_id+' 父类不存在',
        data: {}
      });
    }
  }

  save.user_id = user._id + '';
  // if (!save.avatar) delete save.avatar
  // if (!save.parent_id) delete save.parent_id;

  [ err, result ] = await To(Topic.save({ data: save }))

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    });
  }

  console.log(result);

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
