
import { topics, addTopic, updateTopic } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type childrenTopic {
    _id: String
    name: String
    brief: String
    avatar: String
  }

  # 话题
  type Topic {
    _id: String
    name: String
    brief: String
    description: String
    avatar: String
    background: String
    follow_count: Int
    posts_count: Int
    comment_count: Int
    sort: Int
    create_at: String
    language: Int
    recommend: Boolean
    user_id: String
    follow: Boolean
    parent_id: childrenTopic
    children: [childrenTopic]
  }

  # 更新话题
  type updateTopic {
    success: Boolean
  }

  # 话题计数
  type countTopics {
    count: Int
  }

  # 添加话题
  type addTopic {
    success: Boolean
  }

`

export const Query = `

  # 查询帖子
  topics(${getArguments(topics)}): [Topic]

  # 话题计数
  countTopics(${getArguments(topics)}): countTopics

`

export const Mutation = `

  # 添加话题
  addTopic(${getArguments(addTopic)}): addTopic

  # 更新话题
  updateTopic(${getArguments(updateTopic)}): updateTopic

`
