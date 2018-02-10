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
  # 是否只查询没有
  parent_id: Boolean
): [Comment]

`

exports.Mutation = `

# 更新评论
updateComment(
  _id: String!,
  # 删除 (管理员)
  deleted: Boolean
  # 削弱 (管理员)
  weaken: Boolean
  # 推荐 (管理员)
  recommend: Boolean
  # 话题
  topic_id: String
  # 类型
  type: Int
  # 标题
  title: String
  # 正文JSON
  content: String
  # 正文HTML
  content_html: String
  # 根据时间排序（越大越排前）(管理员)
  sort_by_date: String
): updateComment

`
