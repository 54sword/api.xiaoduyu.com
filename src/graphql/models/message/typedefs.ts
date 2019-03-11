
import { messages, addMessage } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type messages_user_id {
    _id: String
    nickname: String
    avatar_url: String
  }

  type messages {
    _id: String
    user_id: messages_user_id
    addressee_id: messages_user_id
    type: Int
    content: String
    content_html: String
    create_at: String
    ip: String
    blocked: Boolean
    deleted: Boolean
  }

  type countMessages {
    count: Int
  }

  # 添加私信
  type addMessage {
    # 结果
    success: Boolean
    # 私信id
    _id: ID
  }

`

export const Query = `
  # 查询私信
  messages(${getArguments(messages)}): [messages]

  # 查询私信的总数
  countMessages(${getArguments(messages)}): countMessages
`

export const Mutation = `
  # 添加私信
  addMessage(${getArguments(addMessage)}): addMessage
`
