import { Posts } from './posts'

var typeDefs = [ Posts,`

type Author {
  id: Int
  firstName: String
  lastName: String
  posts: [Post]
  success: Boolean
  error: Int
}

type Post {
  id: Int
  title: String
  text: String
  views: Int
  author: Author
}


# 查
type Query {
  hello(title: String!): String
  author(firstName: String, lastName: String): Author
  posts(
    _id: ID,
    # 帖子id
    topic_id: ID,
    # 用户id
    user_id: ID,
    # 小于等于创建日期
    lte_create_at: Int,
    # 大于等于创建日期
    gte_create_at: Int,
    # 弱化
    weaken: Boolean,
    # 推荐
    recommend: Boolean,
    # 删除
    deleted: Boolean,
    # 排序
    sort: String,
    # 跳过多少个
    skip: Int,
    # 每个显示数量
    limit: Int
  ): [Posts]
  #user(id: String): User
}

# 增、删、改
type Mutation {
  addPosts(message: String): addPosts
}

schema {
  mutation: Mutation
  query: Query
}

`];

export default typeDefs;
