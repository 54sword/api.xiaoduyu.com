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
  posts(_id: ID, json: String): [Posts]
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
