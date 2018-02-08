import Posts from './posts'
import Topic from './topic'
import User from './user'
import Comment from './comment'
import UserNotification from './user-notification'

var typeDefs = [ `

${Posts.Schema}
${Topic.Schema}
${User.Schema}
${Comment.Schema}
${UserNotification.Schema}

# 查询API
type Query {
  ${Posts.Query}
  ${Topic.Query}
  ${User.Query}
  ${Comment.Query}
  ${UserNotification.Query}
}

# 增、删、改API
type Mutation {
  ${Posts.Mutation}
  ${Topic.Mutation}
  ${User.Mutation}
  ${Comment.Mutation}
  ${UserNotification.Mutation}
}

schema {
  mutation: Mutation
  query: Query
}

`];

export default typeDefs;
