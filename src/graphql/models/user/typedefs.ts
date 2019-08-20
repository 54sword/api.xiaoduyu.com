import { users, addUser, updateUser } from './arguments'
import { getArguments } from '../tools'

export const Schema = `
  
  "用户"
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
    ad: String
  }

  "获取自己的个人信息"
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
    # 已废弃的字段
    last_find_subscribe_at: String
    last_find_favorite_at: String
    last_find_excellent_at: String
    has_password: Boolean
    theme: Int
    ad: String
  }

  "更新用户返回"
  type updateUser {
    # 是否更新成功
    success: Boolean
  }

  "用户计数"
  type countUsers {
    count: Int
  }

  "添加用户"
  type addUser {
    success: Boolean
  }

`

export const Query = `
  "查询用户"
  users(${getArguments(users)}): [User]

  "用户计数"
  countUsers(${getArguments(users)}): countUsers

  "查询用户"
  selfInfo: SelfInfo @cacheControl(maxAge: 0)

`

export const Mutation = `

  "添加用户，注册账号"
  addUser(${getArguments(addUser)}): addUser

  "更新用户"
  updateUser(${getArguments(updateUser)}): updateUser

`
