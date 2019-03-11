
import { userNotifications, updateUserNotifaction } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

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
    content_trim: String
  }

  type un__comment {
    _id: ID
    content_html: String
    content_trim: String
  }

  type un_comment {
    _id: ID
    content_html: String
    posts_id: posts_id
    reply_id: un__comment
    parent_id: un__comment
    content_trim: String
  }

  # 话题
  type userNotification {
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

  # 更新用户的通知
  type updateUserNotifaction {
    success: Boolean
  }

  # 用户通知计数
  type countUserNotifications {
    count: Int
  }

  # 获取未读的用户消息
  type fetchUnreadUserNotification {
    ids: [String]
  }

`

export const Query = `

  # 查询用户通知
  userNotifications(${getArguments(userNotifications)}): [userNotification]

  # 用户通知计数
  countUserNotifications(${getArguments(userNotifications)}): countUserNotifications

  # 获取未读的用户消息
  fetchUnreadUserNotification: fetchUnreadUserNotification

`

export const Mutation = `

  # 更新用户的通知
  updateUserNotifaction(${getArguments(updateUserNotifaction)}): updateUserNotifaction

`
