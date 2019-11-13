
import { live, addLive, updateLive } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type Live_user {
    _id: String
    nickname: String
    brief: String
    avatar: String
    avatar_url: String
    posts_count: Int
    comment_count: Int
    fans_count: Int
    follow_people_count: Int
  }
  
  "直播"
  type live {
    _id: String
    user_id: Live_user
    title: String
    notice: String
    cover_image: String
    view_count: Int
    create_at: String
    ban_date: String
    blocked: Boolean
    last_time: String
    status: Boolean
    audience_count: Int
    talk_count: Int
  }

  "查询live累计数"
  type countLive {
    count: Int
  }

  "添加live"
  type addLive {
    success: Boolean
  }

  "更新live"
  type updateLive {
    success: Boolean
  }
`

export const Query = `
  "查询live"
  live(${getArguments(live)}): [live] @cacheControl(scope: PRIVATE)
  "查询live累计数"
  countLive(${getArguments(live)}): countLive @cacheControl(scope: PRIVATE)
`

export const Mutation = `
  "添加live"
  addLive(${getArguments(addLive)}): addLive
  "更新live"
  updateLive(${getArguments(updateLive)}): updateLive
`
