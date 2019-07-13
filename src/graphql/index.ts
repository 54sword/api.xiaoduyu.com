import { ApolloServer, gql } from 'apollo-server-express'
// import { formatError } from 'apollo-errors'
// import { makeExecutableSchema } from 'graphql-tools'

// import { MemcachedCache } from 'apollo-server-cache-memcached';
import responseCachePlugin from 'apollo-server-plugin-response-cache';

import config from '../../config'
import checkToken from './common/check-token'
// import * as Models from './models/index'
import { typeDefs, resolvers } from './models/index'

// import textReview from './common/text-review'
// textReview(`
// 国家政治江泽民，逃犯条款
// `).then(res=>{
//   console.log(res);
// })

/**
 * 启动 graphql
 * @param  {Object} app - express 的 app
 */
export default (app: any): void => {

  
  // https://www.apollographql.com/docs/apollo-server/whats-new/
  const server = new ApolloServer({
    // schema,
    typeDefs: gql(typeDefs),
    resolvers,
    // formatError,
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
    // persistedQueries: {
    //   cache: new MemcachedCache(
    //     ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
    //     { retries: 10, retry: 10000 }, // Options
    //   ),
    // },
    // https://www.apollographql.com/docs/apollo-server/features/caching/#saving-full-responses-to-a-cache
    // plugins: [responseCachePlugin({
    //   sessionId: (requestContext: any) => {
    //     return requestContext.request.http.headers.get('accesstoken') || 'tourists'
    //   }
    // })],
    // cacheControl: {
    //   defaultMaxAge: 1000
    // },
    // https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html#Enabling-GraphQL-Playground-in-production
    introspection: true,//config.debug,
    playground: true//config.debug
  });

  app.all('*', async (req: any, res: any, next: any) => {

    // 如果header中，包含access token，那么判断是否有效，无效则拒绝请求
    let token = req.headers.accesstoken || '';
    let role = req.headers.role || '';

    if (!token) {
      next();
    } else {
      
      let result = await checkToken({ token, role });
      
      if (!result.user) {
        res.send({
          errors: [{ message: "invalid token" }]
        });
      } else if (result.user.blocked) {
        res.send({
          errors: [{ message: "您的账号被禁止使用", blocked: true }]
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
