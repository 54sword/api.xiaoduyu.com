import { Topic } from '../../modelsa'

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
  
  // === 设置一些默认值

  if (!Reflect.has(options, 'sort_by')) {
    options.sort = {
      sort: -1
    }
  }

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

  topicList = JSON.parse(JSON.stringify(topicList))

  // 如果是登陆用户，显示是否关注了该话题
  if (user && topicList && Reflect.has(select, 'follow')) {
    topicList.map(node => {
      node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
    })
  }

  topicList.map(node => {
    if (node.children) {
      node.children = node.children.join(',')
    } else {
      node.children = ''
    }
  })

  return topicList
}


query.countTopics = async (root, args, context, schema) => {

  const { user, role } = context
  let select = {}
  let { query, options } = Querys({ args, model: 'topic', role })

  //===

  let [ err, count ] = await To(Topic.count({ query }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  return { count }
}

mutation.addTopic = async (root, args, context, schema) => {

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

  // console.log(save);

  [ err, result ] = await To(Topic.save({ data: save }))

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    });
  }

  return { success: true }
}

mutation.updateTopic = async (root, args, context, schema) => {

  const { user, role } = context
  let { query, update } = Updates({ args, model: 'topic', role })

  if (!user || role != 'admin') {
    throw CreateError({
      message: '无权限',
      data: {}
    });
  }

  // --------------------------------------

  let err, result, topic;

  [ err, topic ] = await To(Topic.findOne({ query: { _id: query._id } }))

  if (err) {
    throw CreateError({
      message: '_id 查询失败',
      data: { errorInfo: err.message || '' }
    });
  }

  if (!topic) {
    throw CreateError({
      message: '_id 不存在',
      data: {}
    });
  }

  // 判断是否存在这个话题
  if (topic.name != update.name) {

    [ err, result ] = await To(Topic.findOne({ query: { name: update.name } }))

    if (err) {
      throw CreateError({
        message: 'name 查询失败',
        data: { errorInfo: err.message || '' }
      });
    }

    if (result) {
      throw CreateError({
        message: '_id 已存在',
        data: {}
      });
    }

  }

  // 如果存在父类，必须选择一个父类
  if (topic && topic.parent_id && !update.parent_id) {
    throw CreateError({
      message: '必须提交 parent_id',
      data: {}
    });
  } else if (topic && !topic.parent_id && update.parent_id) {
    throw CreateError({
      message: '必须提交 parent_id',
      data: {}
    });
  }

  // 如果有父类，检查父类是否存在
  if (update.parent_id && topic.parent_id != update.parent_id) {
    if (update.parent_id) {
      [ err, result ] = await To(Topic.findOne({ query: { _id: update.parent_id } }))

      if (err) {
        throw CreateError({
          message: 'name 查询失败',
          data: { errorInfo: err.message || '' }
        });
      }

      if (!result) {
        throw CreateError({
          message: 'parent_id 不存在',
          data: {}
        });
      }
    }
  }

  if (Reflect.has(update, 'parent_id')) {
    if (update.parent_id) {
    } else {
      update.parent_id = null
    }
  }

  [ err ] = await To(Topic.update({ query, update }))

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message || '' }
    });
  }

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
