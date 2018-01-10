
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hello: String
  }
  type Character {
    name: String
    homeWorld: Planet
    friends: [Character]
  }
`);

var root = {
  hello: () => 'Hello world!'
};


module.exports = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
})
