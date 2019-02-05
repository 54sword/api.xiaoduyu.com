
import { notifications, updateNotifaction } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  # 话题
  type notification {
    addressee_id: [String],
    deleted: Boolean,
    create_at: String,
    _id: String,
    type: String,
    sender_id: sender_id
    target: String
  }

  # 更新用户的通知1
  type updateNotifaction {
    success: Boolean
  }

  # 评论计数
  type countNotifications {
    count: Int
  }

`

export const Query = `

  # 查询用户通知
  notifications(${getArguments(notifications)}): [notification]

  # 评论计数
  countNotifications(${getArguments(notifications)}): countNotifications

`

export const Mutation = `

  # 更新用户的通知
  updateNotifaction(${getArguments(updateNotifaction)}): updateNotifaction

`
