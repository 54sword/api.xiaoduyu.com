
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

export const Schema = `

  # 添加消息
  type addMessage {
    # 结果
    success: Boolean
    # message id
    _id: ID
  }

  # 更新消息
  type updateMessage {
    success: Boolean
  }

  # 获取消息
  type Messages {
    user_id: _User
    addressee_id: _User
    type: Int
    content: String
    content_html: String
    create_at: String
    device: Int
    ip: String
    blocked: Boolean
    deleted: Boolean
  }

  # 评论计数
  type countMessages {
    count: Int
  }

`

export const Query = `

  # 查询用户
  messages(${getQuerySchema('message')}): [Messages]

  # 评论计数
  countMessages(${getQuerySchema('message')}): countMessages

`

export const Mutation = `

  # 添加评论
  addMessage(${getSaveSchema('message')}): addMessage

  # 更新评论
  updateMessage(${getUpdateSchema('message')}): updateMessage

`
