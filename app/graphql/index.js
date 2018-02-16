
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schemas';
import resolvers from './resolvers';

import router from './router';
import checkToken from './auto';

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
			debug: false,
      schema,
			rootValue: {
				// test:'test'
			},
      context: {
        user: req.user || null,
        role: req.role || '',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        jwtTokenSecret: app.get('jwtTokenSecret')
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
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  app.use('/', router());
}
