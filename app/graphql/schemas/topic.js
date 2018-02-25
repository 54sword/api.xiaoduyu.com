
import Query from '../querys'
import Saves from '../saves'
import Updates from '../updates'

const { querySchema } = Query({ model: 'topic' })
const { saveSchema } = Saves({ model: 'topic' })
const { updateSchema } = Updates({ model: 'topic' })

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

exports.Query = `

# 查询帖子
topics(${querySchema}): [Topic]

# 话题计数
countTopics(${querySchema}): countTopics

`

exports.Mutation = `

addTopic(${saveSchema}): addTopic
updateTopic(${updateSchema}): updateTopic

`
