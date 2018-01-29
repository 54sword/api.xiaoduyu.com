
exports.Posts = `

type User {
  _id: String
  nickname: String
  brief: String
  avatar: String
  avatar_url: String
}

type Topic {
  _id: String
  name: String
}

type Comment {
  _id: String
  user_id: User
  posts_id: String
  like_count: Int
  reply_count: Int
  create_at: String
  content_html: String
  like: Boolean
}

type Posts {
  _id: ID!
  user_id: User
  topic_id: Topic
  type: String
  title: String
  content: String,
  content_html: String
  create_at: String
  update_at: String
  last_comment_at: String
  comment_count: Int
  view_count: Int
  follow_count: Int
  like_count: Int
  device: Int
  ip: String
  deleted: Boolean
  verify: Boolean
  recommend: Boolean
  weaken: Boolean
  sort_by_date: String
  comment: [Comment]
}

type addPosts {
  success: Boolean
  error: Int
}

`
