
import Query from '../querys'
import Updates from '../updates'
const { querySchema } = Query({ model: 'notification' })
const { updateSchema } = Updates({ model: 'notification' })

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

# 评论计数
type notificationsCount {
  count: Int
}

`

exports.Query = `

# 查询用户通知
notifications(${querySchema}): [notification]

# 评论计数
notificationsCount(${querySchema}): notificationsCount

`

exports.Mutation = `

# 更新用户的通知
updateNotifaction(${updateSchema}): updateNotifaction

`
