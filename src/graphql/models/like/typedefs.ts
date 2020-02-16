import { likes, like } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  "like的用户信息"
  type likes_user_id {
    _id: String
    nickname: String
    brief: String
    avatar: String
    avatar_url: String
  }

  "like"
  type likes {
    _id: String
    user_id: likes_user_id
    type: String
    target_id: ID
    mood: Int
    deleted: Boolean
    create_at: String
  }

  "like累计"
  type countLikes {
    count: Int
  }

  "添加或取消like"
  type like {
    success: Boolean
  }
`

export const Query = `
  likes(${getArguments(likes)}): [likes] @cacheControl(scope: PRIVATE)
  countLikes(${getArguments(likes)}): countLikes @cacheControl(scope: PRIVATE)
`

export const Mutation = `
  "赞"
  like(${getArguments(like)}): like
`
