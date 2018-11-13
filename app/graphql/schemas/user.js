
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

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
    source: Int
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
    follow: Boolean
  }

  # 获取自己的个人信息
  type SelfInfo {
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
    block_comment_count: Int
    gender: Int
    nickname: String
    banned_to_post: String
    avatar_url: String
    email: String
    weibo: Boolean
    qq: Boolean
    github: Boolean
    phone: String
    area_code: String
    find_notification_at: String
    last_find_posts_at: String
    last_find_feed_at: String
    has_password: Boolean
  }

  # 更新用户返回
  type updateUser {
    # 是否更新成功
    success: Boolean
  }

  # 用户计数
  type countUsers {
    count: Int
  }

  type addUser {
    success: Boolean
  }

`

exports.Query = `

  # 查询用户
  users(${getQuerySchema('user')}): [User]

  # 用户计数
  countUsers(${getQuerySchema('user')}): countUsers

  # 查询用户
  selfInfo(
    # 随机字符串，让他始终从服务器获取
    randomString: String
  ): SelfInfo

`

exports.Mutation = `

  # 添加用户
  addUser(${getSaveSchema('user')}): addUser

  # 更新用户
  updateUser(${getUpdateSchema('user')}): updateUser

`
