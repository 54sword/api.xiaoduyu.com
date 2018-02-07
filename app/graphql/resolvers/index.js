
import posts from './posts'
import topic from './topic'
import user from './user'
import comment from './comment'

let Query = {}
let Mutation = {}

Object.assign(Query, posts.query)
Object.assign(Mutation, posts.mutation)
Object.assign(Query, topic.query)
Object.assign(Mutation, topic.mutation)
Object.assign(Query, user.query)
Object.assign(Mutation, user.mutation)
Object.assign(Query, comment.query)
Object.assign(Mutation, comment.mutation)

var resolvers = {
  Query,
  Mutation
}

Object.assign(resolvers, posts.resolvers)
Object.assign(resolvers, topic.resolvers)
Object.assign(resolvers, user.resolvers)
Object.assign(resolvers, comment.resolvers)

export default resolvers
