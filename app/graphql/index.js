
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import { makeExecutableSchema } from 'graphql-tools';

import { debug, jwt_secret } from '../../config'

import typeDefs from './schemas';
import resolvers from './resolvers';

import router from './router';
import checkToken from './auto';

let schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = (app, bodyParser) => {

  app.use('/graphql', bodyParser.json(), async (req, res, next) => {

    /**
     * 如果header中，包含access token，那么判断是否有效，无效则拒绝请求
     */
    let token = req.headers.accesstoken || '';
    let role = req.headers.role || '';

    if (!token) return next();

    let result = await checkToken({
      token, role, jwtTokenSecret: jwt_secret
    });

    if (!result.user) {
      res.status(403);
      res.send({
        errors: [{
          "message": "invalid token"
        }]
      });
    } else {
      req.user = result.user;
      req.role = result.role;
      next();
    }

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
        jwtTokenSecret: jwt_secret
      },
			formatParams: params =>{
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
    };
  }))

  // IDE
  if (debug) app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  app.use('/', router());
}
