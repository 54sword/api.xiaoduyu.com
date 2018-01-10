// import {
//   makeExecutableSchema,
// } from 'graphql-tools';
// import resolvers from './resolvers';

// 定义schema
var typeDefs = [`
type Query {
  hello: String
}

schema {
  query: Query
}`];

// const typeDefs = `
// type Author {
//   id: Int
//   firstName: String
//   lastName: String
//   posts: [Post]
// }
// type Post {
//   id: Int
//   title: String
//   text: String
//   views: Int
//   author: Author
// }
// type Query {
//   author(firstName: String, lastName: String): Author # 查询作者信息
//   getFortuneCookie: String
// }
// `;

// const schema = makeExecutableSchema({ typeDefs, resolvers });

export default typeDefs;
