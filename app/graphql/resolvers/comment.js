
import Comment from '../../modelsa/comment'
import Like from '../../modelsa/like'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.comments = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys(args, 'comment')

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===

  let err, commentList = [], likeList = []

  options.populate = []

  if (Reflect.has(select, 'user_id') && select.user_id) {
    options.populate.push([
      { path: 'user_id', select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 } }
    ])
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.populate.push([
      { path: 'reply_id', select:{ 'user_id': 1, '_id': 0 } }
    ])
  }

  if (Reflect.has(select, 'posts_id') && select.posts_id) {
    options.populate.push([
      { path: 'posts_id', select: { _id:1, title:1, content_html:1 } }
    ])
  }

  if (Reflect.has(select, 'reply') && select.reply) {

    // reply 添加屏蔽条件
    if (user && !query._id) {
      options.populate.push({
        path: 'reply',
        select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
        options: { limit: 10 },
        match: { user_id: { '$nin': user.block_people }, deleted: false }
      })
    } else {
      options.populate.push({
        path: 'reply',
        select: { __v:0, content: 0, ip: 0, blocked: 0, deleted: 0, verify: 0, reply: 0 },
        options: { limit: 10 },
        match: { deleted: false }
      })
    }

  }

  // let comments = [];

  [ err, commentList ] = await To(Comment.find({ query, select, options }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  options = []

  if (Reflect.has(select, 'reply') && select.reply) {
    options.push({
      path: 'reply.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
    })
    options.push({
      path: 'reply.reply_id',
      model: 'Comment',
      select:{ '_id': 1, 'user_id': 1 }
    })
  }

  if (Reflect.has(select, 'reply_id') && select.reply_id) {
    options.push({
      path: 'reply_id.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
    })
  }
  
  if (options.length > 0) {
    [ err, commentList ] = await To(Comment.populate({ collections: commentList, options }))
  }

  options = []

  if (Reflect.has(select, 'reply') && select.reply) {
    options.push({
      path: 'reply.reply_id.user_id',
      model: 'User',
      select:{ '_id': 1, 'nickname': 1, 'create_at': 1, 'avatar': 1 }
    })
  }

  if (options.length > 0) {
    [ err, commentList ] = await To(Comment.populate({ collections: commentList, options }))
  }

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  // } catch (err) {
  //   console.log(err);
  //   res.send({ success: false })
  //   return
  // }

  // 如果未登录，那么直接返回结果
  if (!user || !select.like || Reflect.has(select, 'like') && !select.like) {
    return commentList
  }

  // 查询是否点赞了评论或回复

  commentList = JSON.stringify(commentList);
  commentList = JSON.parse(commentList);

  var ids = []

  commentList.map(function(item){
    ids.push(item._id)
    if (item.reply) item.reply.map(item => ids.push(item._id))
  })

  if (!select.like || Reflect.has(select, 'like') && !select.like) {
    return commentList
  }

  [ err, likeList ] = await To(Like.find({
    query: {
      $or: [
        {
          type: 'comment',
          deleted: false,
          target_id: { '$in': ids },
          user_id: user._id
        },
        {
          type: 'reply',
          deleted: false,
          target_id: { '$in': ids },
          user_id: user._id
        }
      ]
    },
    select: { target_id: 1, _id: 0 }
  }))

  ids = {}

  likeList.map(function(item){
    ids[item.target_id] = 1
  })

  commentList.map(function(item){
    if (ids[item._id]) {
      item.like = true
    } else {
      item.like = false
    }

    if (item.reply) {
      item.reply.map(function(item){
        if (ids[item._id]) {
          item.like = true
        } else {
          item.like = false
        }
      })
    }

  })

  /*
  Like.find({
    $or: [
      {
        type: 'comment',
        deleted: false,
        target_id: { '$in': ids },
        user_id: user._id
      },
      {
        type: 'reply',
        deleted: false,
        target_id: { '$in': ids },
        user_id: user._id
      }
    ]
  }, { target_id: 1, _id: 0 }, {}, function(err, likes){
    if (err) console.log(err)

    var ids = {}

    likes.map(function(item){
      ids[item.target_id] = 1
    })

    comments.map(function(item){
      if (ids[item._id]) {
        item.like = true
      } else {
        item.like = false
      }

      if (item.reply) {
        item.reply.map(function(item){
          if (ids[item._id]) {
            item.like = true
          } else {
            item.like = false
          }
        })
      }

    })

    res.send({ success: true, data: comments })

  })
  */


  return commentList
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
