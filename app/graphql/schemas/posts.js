exports.Schema = `

type User {
  _id: String
  nickname: String
  brief: String
  avatar: String
  avatar_url: String
}

type Topic {
  _id: String
  name: String
}

type Comment {
  _id: String
  user_id: User
  posts_id: String
  like_count: Int
  reply_count: Int
  create_at: String
  content_html: String
  like: Boolean
}

type Posts {
  _id: ID!
  user_id: User
  topic_id: Topic
  type: String
  title: String
  content: String,
  content_html: String
  create_at: String
  update_at: String
  last_comment_at: String
  comment_count: Int
  view_count: Int
  follow_count: Int
  like_count: Int
  device: Int
  ip: String
  deleted: Boolean
  verify: Boolean
  recommend: Boolean
  weaken: Boolean
  sort_by_date: String
  comment: [Comment]
}

type addPosts {
  success: Boolean
  error: Int
}

type editPosts {
  success: Boolean
}

`

exports.Query = `

# 查询帖子
posts(
  # 帖子id
  _id: ID,
  # 话题id
  topic_id: ID,
  # 用户id
  user_id: ID,
  # 小于等于创建日期
  end_create_at: String,
  # 大于等于创建日期
  start_create_at: String,
  # 弱化
  weaken: Boolean,
  # 推荐
  recommend: Boolean,
  # 删除
  deleted: Boolean,
  # 排序
  sort: String,
  # 跳过多少个
  page_number: Int,
  # 每个显示数量
  page_size: Int
  # 排序
  sort_by: String
): [Posts]

`

exports.Mutation = `

addPosts(message: String): addPosts

# 编辑Posts
editPosts(
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
): editPosts

`
