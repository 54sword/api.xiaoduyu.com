
import Query from '../querys'
import Updates from '../updates'
const { querySchema } = Query({ model: 'user-notification' })
const { updateSchema } = Updates({ model: 'user-notification' })

exports.Schema = `

type sender_id {
  create_at: String
  avatar: String
  _id: String
  nickname: String
  avatar_url: String
  id: ID
}

type addressee_id {
  create_at: String
  avatar: String
  _id: String
  nickname: String
  avatar_url: String
  id: ID
}

type posts_id {
  title: String
  content_html: String
  _id: ID
}

type un__comment {
  _id: ID
  content_html: String
}

type un_comment {
  _id: ID
  content_html: String
  posts_id: posts_id
  reply_id: un__comment
  parent_id: un__comment
}

# 话题
type userNotification {
  has_read: Boolean
  deleted: Boolean
  create_at: String
  _id: String
  type: String
  comment_id: un_comment
  sender_id: sender_id
  addressee_id: addressee_id
  posts_id: posts_id
}

# 更新用户的通知
type updateUserNotifaction {
  success: Boolean
}

# 用户通知计数
type countUserNotifications {
  count: Int
}

`

exports.Query = `

# 查询用户通知
userNotifications(${querySchema}): [userNotification]

# 用户通知计数
countUserNotifications(${querySchema}): countUserNotifications

`

exports.Mutation = `

# 更新用户的通知
updateUserNotifaction(${updateSchema}): updateUserNotifaction

`
