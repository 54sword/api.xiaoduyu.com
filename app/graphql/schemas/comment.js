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

# 话题
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

`

exports.Query = `

# 查询用户
comments(
  _id: ID
  # 削弱
  weaken: Boolean
  # 删除
  deleted: Boolean
  # 推荐
  recommend: Boolean
  # 跳过多少个
  page_number: Int
  # 每个显示数量
  page_size: Int
  # 排序
  sort_by: String
  # 开始日期
  start_create_at: String
  # 结束日期
  end_create_at: String
  # 用户ID
  user_id: String
  # 帖子ID
  posts_id: String
): [Comment]

`

exports.Mutation = `

`
