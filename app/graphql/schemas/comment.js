
import Query from '../querys'
import Updates from '../updates'
const { querySchema } = Query({ model: 'comment' })
const { updateSchema } = Updates({ model: 'comment' })

exports.Schema = `

type _ReplyUser {
  _id: String
  user_id: _User
}

type _Reply {
  _id: String
  user_id: _User
  posts_id: String
  parent_id: String
  reply_id: _ReplyUser
  update_at: String
  weaken: Boolean
  device: Int
  like_count: Int
  reply_count: Int
  create_at: String
  content_html: String
}

type _Posts {
  _id: String
  title: String
  content_html: String
}

# 评论
type Comment {
  content_html: String
  create_at: String
  reply_count: Int
  like_count: Int
  device: Int
  ip: String
  blocked: Int
  deleted: Int
  verify: Int
  weaken: Int
  recommend: Int
  _id: String
  user_id: _User
  posts_id: _Posts
  parent_id: String
  reply_id: _ReplyUser
  reply: [_Reply]
}

# 更新评论
type updateComment {
  success: Boolean
}

# 评论计数
type countComments {
  count: Int
}

`

exports.Query = `

# 查询用户
comments(${querySchema}): [Comment]

# 评论计数
countComments(${querySchema}): countComments

`

exports.Mutation = `

# 更新评论
updateComment(${updateSchema}): updateComment

`
