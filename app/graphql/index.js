var { makeExecutableSchema } = require('graphql-tools');

import typeDefs from './schema'
import resolvers from './resolvers'

// console.log(schema);

// console.log(resolvers);


// var typeDefs = [`
// type Query {
//   hello: String
// }
//
// schema {
//   query: Query
// }`];

// var resolvers = {
//   Query: {
//     hello(root) {
//       return 'world';
//     }
//   }
// };


module.exports = makeExecutableSchema({typeDefs, resolvers});
