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


exports.add = function(req, res, next) {

  var user = req.user;

  var newNode = {
    name: req.body.name,
    brief: req.body.brief,
    avatar: req.body.avatar,
    description: req.body.description,
    user_id: user._id
  }

  if (req.body.parent_id) {
    newNode.parent_id = req.body.parent_id
  }

  async.waterfall([

    function(callback) {
      if (!newNode.name || !newNode.description || !newNode.brief
        // !newNode.avatar ||
      ) {
        callback(10005)
      } else {
        callback(null)
      }
    },

    function(callback) {
      Topic.fetch({ name: newNode.name }, {}, {}, function(err, node){
        if (err) console.log(err)
        if (node && node.length > 0) {
          callback(15003)
        } else {
          callback(null)
        }
      })
    },

    function(callback) {
      Topic.add(newNode, function(err, newnode){
        if (err) console.log(err)
        callback(null, newnode)
      });
    }
  ], function(err, result){
    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true,
        data: result
      });
    }
  })

};

exports.update = function(req, res, next) {

  var user = req.user,
      id = req.body.id,
      parentId = req.body.parent_id,
      name = req.body.name,
      brief = req.body.brief,
      avatar = req.body.avatar,
      description = req.body.description

  async.waterfall([

    function(callback) {
      //  || !avatar
      if (!name || !description || !brief) {
        callback(10005)
      } else {
        callback(null)
      }
    },

    // 判断节点是否存在
    function(callback) {
      Topic.fetch({ _id: id }, { _id: 1 }, {}, function(err, nodes){
        if (err) console.log(err)
        if (!nodes || nodes.length == 0) {
          callback(15000)
        } else {
          callback(null, nodes[0])
        }
      });
    },

    // 判断名字是否已经存在
    function(node, callback) {

      if (node.name != name) {
        Topic.fetch({ name: name }, {}, {}, function(err, node){
          if (err) console.log(err)
          if (node && node.length > 1) {
            callback(15003)
          } else {
            callback(null)
          }
        })
      } else {
        callback(null)
      }

    },


    function(callback) {

      if (!parentId) {
        callback(null)
        return
      }

      // 如果有父节点，判断节点是否存在
      Topic.fetch({ _id: parentId }, { _id: 1 }, {}, function(err, nodes){
        if (err) console.log(err)
        if (!nodes || nodes.length == 0) {
          callback(15001)
        } else {
          callback(null)
        }
      });
    },

    function(callback) {

      var contents = {
        name: name,
        brief: brief,
        avatar: avatar,
        description: description
      }

      if (parentId) {
        contents.parent_id = parentId;
      }

      Topic.update(
        { _id: id },
        contents,
        function(err){
          if (err) console.log(err)

          // if (parentId) {
          //   Node.updateChildren(parentId, function(){
          //     callback(null)
          //   })
          // } else {
            callback(null)
          // }

        }
      );

    }
  ], function(err, result){

    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true
      });
    }

  })

}

exports.fetch = async (req, res) => {

  const user = req.user
  let json = req.query[0] || ''

  if (!isJSON(json)) return res.send({ error: 11000, success: false })

  // 检查参数是否合法
  json = checkParams(JSON.parse(json))

  // 如果有非法参数，返回错误
  if (Reflect.has(json, 'success') && Reflect.has(json, 'error')) {
    return res.send(json)
  }

  let { query, select, options } = json

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

  let nodes = await Topic.find({ query, select, options })

  if (!nodes) return res.send({ success: false, error: 10004 })

  if (user && nodes) {
    nodes = JSON.parse(JSON.stringify(nodes))
    nodes.map(node => {
      node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
    })
  }

  res.send({ success: true, data: nodes })
}
