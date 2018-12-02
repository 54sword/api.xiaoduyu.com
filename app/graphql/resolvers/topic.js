import { Topic } from '../../modelsa'

// tools
import To from '../../common/to'
import CreateError from './errors'
// import Querys from '../querys'
// import Updates from '../updates'
// import Saves from '../saves'


import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];

/*
const s = async () => {
  let [ err, res ] = await To(Topic.find({ query:{}, select:{} }));
  console.log(err);
  console.log(res);
}

s();
*/

query.topics = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}, err, res, query = {}, options = {}, topicList;
  // let { query, options } = Querys({ args, model: 'topic', role });

  [ err, query ] = getQuery({ args, model:'topic', role });
  [ err, options ] = getOption({ args, model:'topic', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  // === 设置一些默认值
  /*
  if (!Reflect.has(options, 'sort_by')) {
    options.sort = {
      sort: -1
    }
  }
  */

  //===

  // 如果需要返回 parent_id，则获取 parent_id 的详细信息
  if (Reflect.has(select, 'parent_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'parent_id',
      model: 'Topic',
      select: { '_id': 1, 'avatar': 1, 'name': 1 }
    });
  }

  if (Reflect.has(select, 'children')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'children',
      model: 'Topic',
      select: { '_id': 1, 'avatar': 1, 'name': 1 },
      options: {
        sort: {
          recommend: -1,
          sort: -1,
          posts_count: -1
        }
      }
    });
  }

  [ err, topicList ] = await To(Topic.find({ query, select, options }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (topicList) {

    topicList = JSON.parse(JSON.stringify(topicList));

    // 如果是登陆用户，显示是否关注了该话题
    if (user && topicList && Reflect.has(select, 'follow')) {
      topicList.map(node => {
        node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
      })
    }

  } else {
    topicList = [];
  }

  return topicList
}


query.countTopics = async (root, args, context, schema) => {

  const { user, role } = context
  let err, select = {}, query, options, count;
  // let { query, options } = Querys({ args, model: 'topic', role })

  [ err, query ] = getQuery({ args, model:'topic', role });
  [ err, options ] = getOption({ args, model:'topic', role });

  //===

  [ err, count ] = await To(Topic.count({ query }))

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
  let err, result, save;
  [ err, save ] = getSaveFields({ args, model: 'topic', role });


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

  if (save.parent_id) {
    uploadTopicChildren(save.parent_id);
  }

  return { success: true }
}

mutation.updateTopic = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, query, update, topic, result;

  [ err, query ] = getUpdateQuery({ args, model: 'topic', role });
  [ err, update ] = getUpdateContent({ args, model: 'topic', role });

  if (!user || role != 'admin') {
    throw CreateError({
      message: '无权限',
      data: {}
    });
  }

  // --------------------------------------

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

  uploadTopicChildren(topic.parent_id ? topic.parent_id : topic._id);

  return { success: true }
}

const uploadTopicChildren = async (topicId) => {

  let [ err, list ] = await To(Topic.find({ query: { parent_id: topicId } }));

  if (!list) return;

  let ids = [];

  list.map(item=>{
    ids.push(item._id);
  });

  Topic.update({
    query: { _id: topicId },
    update: { children: ids }
  });

}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
