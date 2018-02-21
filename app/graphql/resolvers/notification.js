
// import User from '../../modelsa/user'
import Notification from '../../modelsa/notification'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.notifications = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys({ args, model: 'notification', role })

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===

  options.populate = [
    {
      path: 'sender_id',
      select: {
        '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1
      }
    }
  ]

  let [ err, list ] = await To(Notification.find({ query, select, options }))

  return list
}

query.notificationsCount = async (root, args, context, schema) => {

  const { user, role } = context
  let { query } = Querys({ args, model: 'notification', role })

  let [ err, count ] = await To(Notification.count({ query }))

  return {
    count
  }
}

mutation.updateNotifaction = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let options = {}
  // let { query, options } = Querys(args, 'user')
  let { query, update } = Updates({ args, model: 'notification', role })

  // console.log('123123');

  // select
  // schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===


  // if (!query._id) {
  //   return res.send({ success: false, error: 90002, error_data: { argument: 'query._id' } })
  // }

  let [ err, result ] = await To(Notification.update({ query, update, options }))

  // console.log(err);
  // console.log(result);

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
exports.resolvers = resolvers
