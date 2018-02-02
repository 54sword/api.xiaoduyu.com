
import posts from './posts'
import topic from './topic'

let Query = {}
let Mutation = {}

Object.assign(Query, posts.query)
Object.assign(Mutation, posts.mutation)
Object.assign(Query, topic.query)
Object.assign(Mutation, topic.mutation)

var resolvers = {
  Query,
  Mutation
}

Object.assign(resolvers, posts.resolvers)
Object.assign(resolvers, topic.resolvers)

export default resolvers
