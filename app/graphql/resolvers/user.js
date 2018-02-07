
import User from '../../modelsa/user'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.users = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys(args, 'user')

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===

  let [ err, userList ] = await To(User.find({ query, select, options }))

  return userList
}

mutation.updateUser = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let options = {}
  // let { query, options } = Querys(args, 'user')
  let { query, update } = Updates(args, 'user', role)

  // console.log('123123');

  // select
  // schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===


  // if (!query._id) {
  //   return res.send({ success: false, error: 90002, error_data: { argument: 'query._id' } })
  // }

  let [ err, result ] = await To(User.update({ query, update, options }))

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
