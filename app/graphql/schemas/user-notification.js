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
type userNotifications {
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

`

exports.Query = `

# 查询用户通知
userNotifications(
  _id: ID
  # 发件人用户ID
  sender_id: ID
  # 收件人用户ID
  addressee_id: ID
  # 帖子ID
  posts_id: ID
  # 评论ID
  comment_id: ID
  # 删除状态
  deleted: Boolean
  # 类型
  type: String
  # 是否已读
  has_read: Boolean
  # 排序
  sort_by: String
  # 跳过多少个
  page_number: Int
  # 每个显示数量
  page_size: Int
  # 开始日期
  start_create_at: String
  # 结束日期
  end_create_at: String
): [userNotifications]

`

exports.Mutation = `

`
