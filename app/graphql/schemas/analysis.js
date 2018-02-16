
exports.Schema = `

# 登录
type analysis {
  user_count: Int
  posts_count: Int
  comment_count: Int
  notification_count: Int
  userNotification_count: Int
}

`

exports.Query = `

# 登录
analysis(
  # 开始日期
  start_create_at: String
  # 结束日期
  end_create_at: String
): analysis

`

exports.Mutation = `
`
