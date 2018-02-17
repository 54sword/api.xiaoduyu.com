
import Query from '../querys'
const { querySchema } = Query({ model: 'notification' })

exports.Schema = `

# 话题
type notification {
  addressee_id: [String],
  deleted: Boolean,
  create_at: String,
  _id: String,
  type: String,
  sender_id: sender_id
  target: String
}

# 更新用户的通知
type updateNotifaction {
  success: Boolean
}

`

exports.Query = `

# 查询用户通知
notifications(${querySchema}): [notification]

`

exports.Mutation = `

# 更新用户的通知
updateNotifaction(
  _id: ID!
  # 删除 (管理员)
  deleted: Boolean
): updateNotifaction

`
