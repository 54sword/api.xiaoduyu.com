
import { feed } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type _Feed_User {
    _id: String
    nickname: String
    brief: String
    avatar: String
    avatar_url: String
  }

  type _Feed_Comment_Posts {
    _id: String
    user_id: _Feed_User
    title: String
    content_html: String
    create_at: String
  }

  type _Feed_Comment_Reply {
    _id: String
    user_id: _Feed_User
    content_html: String
    create_at: String
  }

  type _Feed_Comment {
    _id: String
    user_id: _Feed_User
    # posts_id: _Feed_Comment_Posts
    like_count: Int
    reply_count: Int
    create_at: String
    content_html: String
    like: Boolean
  }

  type _Feed_Comment_A {
    _id: String
    # user_id: _Feed_User
    # posts_id: _Feed_Comment_Posts
    like_count: Int
    reply_count: Int
    create_at: String
    content_html: String
    like: Boolean
    reply_id: _Feed_Comment_Reply
    parent_id: String
  }

  type _Feed_Topic {
    _id: String
    name: String
    avatar: String
  }

  type _Feed_Posts {
    _id: String
    user_id: _Feed_User
    like_count: Int
    comment_count: Int
    view_count: Int
    follow_count: Int
    create_at: String
    device: Int
    title: String
    content_html: String
    comment: [_Feed_Comment]
    topic_id: _Feed_Topic
  }

  type Feed {
    _id: ID
    user_id: _Feed_User
    posts_id: Posts
    comment_id: _Feed_Comment_A
    create_at: String
  }

  type countFeed {
    count: Int
  }

`

export const Query = `
  # 查询帖子
  feed(${getArguments(feed)}): [Feed]

  countFeed(${getArguments(feed)}): countFeed
`

export const Mutation = `
`
