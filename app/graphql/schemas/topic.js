exports.Schema = `


# 话题
type Topic {
  _id: String
  name: String
  brief: String
  description: String
  avatar: String
  background: String
  follow_count: Int
  posts_count: Int
  comment_count: Int
  sort: Int
  create_at: String
  language: Int
  recommend: Boolean
  user_id: String
  follow: Boolean
  parent_id: String
}

type addTopic {
  success: Boolean
}

`

exports.Query = `

# 查询帖子
topics(
  # 帖子id
  _id: ID,
  # 父话题id
  parent_id: ID,
  # 用户id
  user_id: ID,
  # 推荐
  recommend: Boolean,
  # 跳过多少个
  page_number: Int,
  # 每个显示数量
  page_size: Int
  # 排序
  sort_by: String,
  # 是否是父类
  type: String
): [Topic]

`

exports.Mutation = `

addTopic(
  name: String
  brief: String
  description: String
  avatar: String
  background: String
  sort: Int
  recommend: Boolean
  parent_id: String
): addTopic

`
