
import Query from '../querys'
const { querySchema } = Query({ model: 'user' })

exports.Schema = `

# 用户
type User {
  _id: String
  nickname_reset_at: String
  create_at: String
  last_sign_at: String
  blocked: Boolean
  role: Int
  avatar: String
  brief: String
  source: Boolean
  posts_count: Int
  comment_count: Int
  fans_count: Int
  like_count: Int
  follow_people_count: Int
  follow_topic_count: Int
  follow_posts_count: Int
  block_people_count: Int
  block_posts_count: Int
  access_token: String
  gender: Int
  nickname: String
  banned_to_post: String
  avatar_url: String
}

# 获取自己的个人信息
type SelfInfo {
  _id: String
  nickname_reset_at: String
  create_at: String
  last_sign_at: String
  blocked: Boolean
  role: Boolean
  avatar: String
  brief: String
  source: Boolean
  posts_count: Boolean
  comment_count: Boolean
  fans_count: Boolean
  like_count: Boolean
  follow_people_count: Boolean
  follow_topic_count: Boolean
  follow_posts_count: Boolean
  block_people_count: Boolean
  block_posts_count: Boolean
  access_token: String
  gender: Boolean
  nickname: String
  banned_to_post: String
  avatar_url: String
  email: String
  weibo: Boolean
  qq: Boolean
  github: Boolean
}

# 更新用户返回
type updateUser {
  # 是否更新成功
  success: Boolean
}

`

exports.Query = `

# 查询用户
users(${querySchema}): [User]

# 查询用户
selfInfo(
  # 随机字符串，让他始终重服务器获取
  randomString: String
): SelfInfo

`

exports.Mutation = `

# 更新用户
updateUser(
  _id: String!
  # 屏蔽用户
  blocked: Boolean
  # 头像
  avatar: String
  # 一句话自我介绍
  brief: String
  # 性别
  gender: Int
  # 昵称
  nickname: String
  # 禁言时间
  banned_to_post: String
): updateUser

`
