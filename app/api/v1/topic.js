var Topic = require('../../models').Topic;
var User = require('../../models').User;
var async = require('async');

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

};


exports.fetch = function(req, res, next) {

  var user = req.user,
      perPage = req.query.per_page || 20,
      page = req.query.page || 0,
      child = req.query.child,
      nodeId = req.query.topic_id,
      peopleId = req.query.people_id,
      parentId = req.query.parent_id,
      query = {},
      select = { _id: 1, parent_id:1, comment_count: 1, posts_count: 1, follow_count: 1, avatar: 1, description: 1, brief: 1, name: 1 },
      options = {
        sort: { 'question_count': -1 }
      }

  if (child) {
    if (child == 1) {
      query.parent_id = { $exists : true }
    } else {
      query.parent_id = { $exists : false }
    }
  }

  if (nodeId) {
    query._id = { '$in': nodeId.split(',') }
  }

  if (parentId) {
    query.parent_id = { '$in': parentId.split(',') }
  }

  if (page > 0) {
    options.skip = page * perPage
  }

  options.limit = parseInt(perPage)

  options.sort = { 'question_count': -1 }

  async.waterfall([
    function(callback) {

      if (!peopleId) {
        callback(null)
        return
      }

      User.fetch({ _id: peopleId }, { 'follow_topic': 1 }, {}, function(err, people){

        if (!people || people.length == 0) {
          callback(13000)
          return
        }

        query._id = { '$in': people[0].follow_topic }

        callback(null)
      })

    },
    function(callback) {

      Topic.fetch(query, select, options, function(err, nodes){

        if (err) {
          console.log(err)
          callback(err.message)
          return
        }

        if (user) {

          nodes = JSON.stringify(nodes);
          nodes = JSON.parse(nodes);

          nodes.map(function(node, key){
            node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
          })
        }

        callback(null, nodes)

      })

    }
  ],
  function(err, result){

    if (err) {
      res.send({ success: true, error: err })
    } else {
      res.send({ success: true, data: result })
    }

  })


}
