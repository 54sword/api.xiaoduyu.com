import { ApolloServer, gql } from 'apollo-server-express'
import { formatError } from 'apollo-errors'
import { makeExecutableSchema } from 'graphql-tools'

import config from '../config'

const { debug } = config

import typeDefs from './schemas'
import resolvers from './resolvers'

import checkToken from './auto'

const schema = makeExecutableSchema({ typeDefs, resolvers })


/**
 * 启动 graphql
 * @param  {Object} app - express 的 app
 */
module.exports = (app: any) => {

  const server = new ApolloServer({
    schema,
    formatError,
    context: ({ req }: any) => {

      // 获取客户端请求ip
      let ip;
      if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].toString().split(",")[0];
      } else {
        ip = req.connection.remoteAddress;
      }
      
      return {
        user: req.user || null,
        role: req.role || '',
        ip
      }
    },
    // https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html#Enabling-GraphQL-Playground-in-production
    introspection: debug,
    playground: debug
  });

  app.all('*', async (req: any, res: any, next: any) => {

    // 如果header中，包含access token，那么判断是否有效，无效则拒绝请求
    let token = req.headers.accesstoken || '';
    let role = req.headers.role || '';

    if (!token) {
      next();
    } else {

      let result = await checkToken({ token, role })
      
      if (!result.user) {
        res.send({
          errors: [{
            message: "invalid token"
          }]
        });
      } else if (result.user.blocked) {
        res.send({
          errors: [{
            message: "您的账号被禁止使用",
            blocked: true
          }]
        });
      } else {
        req.user = result.user;
        req.role = result.role;
        next();
      }

    }

	});

  server.applyMiddleware({ app, path: '/graphql' });
}
