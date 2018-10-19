
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

  # 添加关注
  type addFollow {
    success: Boolean
  }

  type follow_people_id {
    _id: ID
    nickname: String
    create_at: String
    avatar_url: String
    fans_count: Int
    comment_count: Int
    posts_count: Int
    follow_people_count: Int
    follow_posts_count: Int
    follow_topic_count: Int
    follow: Boolean
    brief: String
  }

  type follow_posts_id {
    _id: ID
    title: String
    follow: Boolean
  }

  type follow_topic_id {
    _id: ID
    avatar: String
    name: String
    follow: Boolean
    brief: String
  }

  # 关注
  type follow {
    user_id: follow_people_id
    topic_id: follow_topic_id
    people_id: follow_people_id
    posts_id: follow_posts_id
    create_at: String
    deleted: Boolean
  }

  type countFindFollows {
    count: Int
  }

`

exports.Query = `

  # 查询关注
  findFollows(${getQuerySchema('follow')}): [follow]

  # 获取关注的累计
  countFindFollows(${getQuerySchema('follow')}): countFindFollows
`

exports.Mutation = `

  # 添加关注
  addFollow(${getSaveSchema('follow')}): addFollow
`
