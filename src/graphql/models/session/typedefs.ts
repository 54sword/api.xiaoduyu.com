
import { sessions, getSession, readSession } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type sessions_user_id {
    _id: String
    nickname: String
    avatar_url: String
  }

  type sessions_last_message {
    content_html: String
    create_at: String
  }
  
  type sessions {
    _id: String
    user_id: sessions_user_id
    addressee_id: sessions_user_id
    last_message: sessions_last_message
    unread_count: Int
    create_at: String
    top_at: String
  }

  type countSessions {
    count: Int
  }
  
  type getSession {
    _id: String
  }

  type readSession{
    success: Boolean
  }

  type getUnreadSessions{
    count: Int
  }

`

export const Query = `
  # 查询私信
  sessions(${getArguments(sessions)}): [sessions]

  # 查询私信的总数
  countSessions(${getArguments(sessions)}): countSessions

  # 获取session
  getSession(${getArguments(getSession)}): getSession

  # 获取未读会话
  getUnreadSessions: getUnreadSessions
`

export const Mutation = `
  # 设置session已阅
  readSession(${getArguments(readSession)}): readSession
`
