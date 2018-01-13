import { Posts } from './posts'

var typeDefs = [ Posts,`

type Author {
  id: Int
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int
  title: String
  text: String
  views: Int
  author: Author
}


type Query {
  hello: String
  author(firstName: String, lastName: String): Author
  posts(_id: ID, json: String): [Posts]
}

mutation{
  addUser(name:"testUser",sex:"男",intro:"简介",skills:[]){
    name
    sex
    intro
  }
}

schema {
  query: Query
}`];

export default typeDefs;
