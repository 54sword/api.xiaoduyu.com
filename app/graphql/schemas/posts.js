
import Query from '../querys';

import Updates from '../updates';
const { querySchema } = Query({ model: 'posts' });
const { updateSchema } = Updates({ model: 'posts' });

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

type _User {
  _id: String
  nickname: String
  brief: String
  avatar: String
  avatar_url: String
}

type _Topic {
  _id: String
  name: String
}

type _Comment {
  _id: String
  user_id: _User
  posts_id: String
  like_count: Int
  reply_count: Int
  create_at: String
  content_html: String
  like: Boolean
}

# 帖子的返回字段
type Posts {
  _id: ID!
  # 作者
  user_id: _User
  # 话题
  topic_id: _Topic
  # 类型
  type: String
  # 标题
  title: String
  # 内容Draft JSON
  content: String,
  # 内容HTML
  content_html: String
  # 创建日期
  create_at: String
  # 最近一次更新日期
  update_at: String
  # 最近一次评论日期
  last_comment_at: String
  # 评论的累计数
  comment_count: Int
  # 浏览的累计数
  view_count: Int
  # 关注的累计数
  follow_count: Int
  # 赞的累计数
  like_count: Int
  # 发帖的设备
  device: Int
  # IP
  ip: String
  # 删除
  deleted: Boolean
  # 验证
  verify: Boolean
  # 推荐
  recommend: Boolean
  # 削弱
  weaken: Boolean
  # 排序
  sort_by_date: String
  # 评论
  comment: [_Comment],
  # 关注（登陆用户）
  follow: Boolean,
  # 赞（登陆用户）
  like: Boolean
}

# 添加帖子
type addPosts {
  # 结果
  success: Boolean
  # posts id
  _id: ID
}

# 更新帖子
type updatePosts {
  success: Boolean
}

# 帖子计数
type countPosts {
  count: Int
}


`

exports.Query = `

# 查询帖子
posts(${getQuerySchema('posts')}): [Posts]

# 帖子计数
countPosts(${getQuerySchema('posts')}): countPosts

`

exports.Mutation = `

# 添加帖子
addPosts(${getSaveSchema('posts')}): addPosts

# 更新帖子
updatePosts(${getUpdateSchema('posts')}): updatePosts

`
