import Posts from './posts'
import Topic from './topic'

var typeDefs = [ `

${Posts.Schema}
${Topic.Schema}

# 查询API
type Query {
  ${Posts.Query}
  ${Topic.Query}
}

# 增、删、改API
type Mutation {
  ${Posts.Mutation}
  ${Topic.Mutation}
}

schema {
  mutation: Mutation
  query: Query
}

`];

export default typeDefs;
