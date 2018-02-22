
import Query from '../querys'
const { querySchema } = Query({ model: 'analysis' })

exports.Schema = `

# 获取网站各种数据状况
type analysis {
  # 用户数量
  user_count: Int
  # 帖子数量
  posts_count: Int
  # 评论数量
  comment_count: Int
  # 广播通知数量
  notification_count: Int
  # 用户通知数量
  userNotification_count: Int
}

`

exports.Query = `
# 获取网站各种数据状况
analysis(${querySchema}): analysis
`

exports.Mutation = `
`
