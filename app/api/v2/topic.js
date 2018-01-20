// var Topic = require('../../modelsa').Topic;
var User = require('../../modelsa').User;
var async = require('async');

import Topic from '../../modelsa/topic'

 // var isJSON = require('is-json');
import isJSON from 'is-json'

import _topic from './params-white-list/topic'
import _checkParams from './params-white-list'

const checkParams = (dataJSON) => {
  return _checkParams(dataJSON, _topic)
}


exports.add = async (req, res, next) => {

  const user = req.user
  let { save } = req.arguments

  let returnObj = { success: false, error: 10005 }

  if (!save.name || !save.description || !save.brief) {
    res.status(400)
    return res.send(returnObj)
  }

  let result = await Topic.findOne({ query: { name: save.name } })

  if (result) {
    returnObj.error = 15003
    res.status(400)
    return res.send(returnObj)
  }

  // 如果有父类，检查父类是否存在
  if (save.parent_id) {
    result = await Topic.findOne({ query: { _id: save.parent_id } })
    if (!result) {
      returnObj.error = 15004
      res.status(400)
      return res.send(returnObj)
    }
  }

  save.user_id = user._id + ''
  if (!save.avatar) delete save.avatar
  if (!save.parent_id) delete save.parent_id

  try {
    result = await Topic.save({ data: save })
    res.send({ success: true, data: result })
  } catch (e) {
    console.log(e)
    res.send({ success: false })
  }

}

exports.update = async (req, res, next) => {
  const user = req.user
  let { query, update } = req.arguments

  let returnObj = { success: false, error: 10005 }

  if (!query._id) {
    return res.send(returnObj)
  }

  if (!update.avatar || !update.name || !update.description || !update.brief) {
    return res.send(returnObj)
  }

  let topic = await Topic.findOne({ query: { _id: query._id } })

  if (!topic) {
    returnObj.error = 15000
    return res.send(returnObj)
  }

  let result

  // 判断是否存在这个话题
  if (topic.name != update.name) {
    result = await Topic.findOne({ query: { name: update.name } })

    if (result) {
      returnObj.error = 15003
      return res.send(returnObj)
    }
  }

  // 如果存在父类，必须选择一个父类
  if (topic && topic.parent_id && !update.parent_id) {
    returnObj.error = 90002
    returnObj.error_data = {
      argument: 'update.parent_id'
    }
    return res.send(returnObj)
  } else if (topic && !topic.parent_id && update.parent_id) {
    returnObj.error = 90001
    returnObj.error_data = {
      argument: 'update.parent_id'
    }
    return res.send(returnObj)
  }

  // 如果有父类，检查父类是否存在
  if (update.parent_id && topic.parent_id != update.parent_id) {
    if (update.parent_id) {
      result = await Topic.findOne({ query: { _id: update.parent_id } })
      if (!result) {
        returnObj.error = 15004
        // res.status(400)
        return res.send(returnObj)
      }
    }
  }

  if (Reflect.has(update, 'parent_id')) {
    if (update.parent_id) {
    } else {
      update.parent_id = null
    }
  }

  try {
    await Topic.update({ query, update })
    res.send({ success: true })
  } catch (e) {
    console.log(res);
    res.send({ success: false })
  }

}

exports.find = async (req, res) => {

  const user = req.user
  let { query, select, options } = req.arguments

  // 如果查询某个用户关注的话题
  if (query.people_id) {

    let people = await User.findOne({
      query: { _id: people_id },
      select: { 'follow_topic': 1 }
    })

    if (!people || !people.length) {
      return res.send({ success: false, error: 13000 })
    }

    delete query.people_id
    query._id = { '$in': people[0].follow_topic }
  }

  // 如果需要返回 parent_id，则获取 parent_id 的详细信息
  if (Reflect.has(select, 'parent_id')) {
    options.populate = [{
      path: 'parent_id',
      select: {
        '_id': 1, 'avatar': 1, 'name': 1
      }
    }]
  }

  let topicList = await Topic.find({ query, select, options })

  if (!topicList) return res.send({ success: false, error: 10004 })

  // 如果是登陆用户，显示是否关注了该话题
  if (user && topicList && Reflect.has(select, 'follow')) {
    topicList = JSON.parse(JSON.stringify(topicList))
    topicList.map(node => {
      node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
    })
  }

  res.send({ success: true, data: topicList, sql: { query, select, options } })
}
