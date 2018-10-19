
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

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

  # 更新用户的通知
  type updateNotifaction {
    success: Boolean
  }

  # 评论计数
  type countNotifications {
    count: Int
  }

`

exports.Query = `

  # 查询用户通知
  notifications(${getQuerySchema('notification')}): [notification]

  # 评论计数
  countNotifications(${getQuerySchema('notification')}): countNotifications

`

exports.Mutation = `

  # 更新用户的通知
  updateNotifaction(${getUpdateSchema('notification')}): updateNotifaction

`
