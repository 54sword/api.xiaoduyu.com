var { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
import { formatError } from 'apollo-errors';
// var schema = require('./app/graphql');
import checkToken from './auto';

import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from './schemas'
import resolvers from './resolvers'

// module.exports = makeExecutableSchema({ typeDefs, resolvers })


let schema = makeExecutableSchema({ typeDefs, resolvers })

module.exports = (app, bodyParser) => {

  app.use('/graphql', bodyParser.json(), async (req, res, next)=>{

    // 如果header在token，判断token是否有效，无效则拒绝请求
    let invalidToken = await checkToken(req)
    if (!invalidToken) {
      res.status(403)
      res.send({
        errors: [{
          "message": "invalid token"
        }]
      })
      return
    }
    next()
  }, graphqlExpress(req => {
    return {
			// tracing: true,
			debug: true,
      schema,
			rootValue: {
				test:'test'
			},
      context: {
        user: req.user || null,
        role: req.role || ''
        // req
      },

			formatParams: params =>{
				// console.log(params)
				return params
			},
			// formatResponse: e => e,
			formatError
			/*
			formatError: error => {
				// console.log('1111111');
				// console.log(err);
			  // return err;
				return {
			    name: error.name,
			    mensaje: error.message
			  }
			}
			*/
      // other options here
    };
  }))


  // IDE
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

}
