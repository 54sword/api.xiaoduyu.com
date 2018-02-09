exports.Schema = `

# 话题
type notification {
  addressee_id: [String],
  deleted: Boolean,
  create_at: String,
  _id: String,
  type: String,
  sender_id: sender_id
  target: String
}

# 更新用户的通知
type updateNotifaction {
  success: Boolean
}

`

exports.Query = `

# 查询用户通知
notifications(
  _id: ID
  # 发件人用户ID
  sender_id: ID
  # 收件人用户ID
  addressee_id: ID
  # 删除状态
  deleted: Boolean
  # 类型
  type: String
  # 排序
  sort_by: String
  # 跳过多少个
  page_number: Int
  # 每个显示数量
  page_size: Int
  # 开始日期
  start_create_at: String
  # 结束日期
  end_create_at: String
): [notification]

`

exports.Mutation = `

# 更新用户的通知
updateNotifaction(
  _id: ID!
  # 删除 (管理员)
  deleted: Boolean
): updateNotifaction

`
