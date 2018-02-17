
import Query from '../querys'
import Saves from '../saves'
const { querySchema } = Query({ model: 'topic' })
const { saveSchema } = Saves({ model: 'topic' })

exports.Schema = `

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
  parent_id: String
}

type addTopic {
  success: Boolean
}

`

exports.Query = `

# 查询帖子
topics(${querySchema}): [Topic]

`

exports.Mutation = `

addTopic(${saveSchema}): addTopic

`
