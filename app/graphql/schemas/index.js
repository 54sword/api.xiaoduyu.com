import Posts from './posts'

var typeDefs = [ `

${Posts.Schema}

type Query {
  ${Posts.Query}
}

# 增、删、改
type Mutation {
  ${Posts.Mutation}
}

schema {
  mutation: Mutation
  query: Query
}

`];

export default typeDefs;
