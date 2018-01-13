
exports.Posts = `

type User {
  _id: String
  nickname: String
  brief: String
  avatar: String
}

type Topic {
  _id: String
  name: String
}

type Posts {
  _id: ID
  user_id: User!
  topic_id: Topic!
  type: String
  title: String
  content_html: String
  create_at: String
  update_at: String
  last_comment_at: String
  comment: String
  comment_count: Int
  view_count: Int
  follow_count: Int
  like_count: [Int]!
  device: [Int]
  ip: String
  deleted: Boolean
  verify: Boolean
  recommend: Boolean
  weaken: Boolean
  sort_by_date: String
}

`
