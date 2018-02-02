exports.Schema = `

type _User {
  _id: String
  nickname: String
  brief: String
  avatar: String
  avatar_url: String
}

type _Topic {
  _id: String
  name: String
}

type _Comment {
  _id: String
  user_id: _User
  posts_id: String
  like_count: Int
  reply_count: Int
  create_at: String
  content_html: String
  like: Boolean
}

# 帖子的返回字段
type Posts {
  _id: ID!
  # 作者
  user_id: _User
  # 话题
  topic_id: _Topic
  # 类型
  type: String
  # 标题
  title: String
  # 内容Draft JSON
  content: String,
  # 内容HTML
  content_html: String
  # 创建日期
  create_at: String
  # 最近一次更新日期
  update_at: String
  # 最近一次评论日期
  last_comment_at: String
  # 评论的累计数
  comment_count: Int
  # 浏览的累计数
  view_count: Int
  # 关注的累计数
  follow_count: Int
  # 赞的累计数
  like_count: Int
  # 发帖的设备
  device: Int
  # IP
  ip: String
  # 删除
  deleted: Boolean
  # 验证
  verify: Boolean
  # 推荐
  recommend: Boolean
  # 削弱
  weaken: Boolean
  # 排序
  sort_by_date: String
  # 评论
  comment: [_Comment],
  # 关注（登陆用户）
  follow: Boolean,
  # 赞（登陆用户）
  like: Boolean
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
  # 模式(user_follow)
  method: String
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
