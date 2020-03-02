import { ApolloServer, gql, AuthenticationError, UserInputError } from 'apollo-server-express'
import responseCachePlugin from 'apollo-server-plugin-response-cache';
// import CreateError from './common/errors';

import checkToken from './common/check-token'
import { typeDefs, resolvers } from './models/index'

import config from '@config'

/**
 * 启动 graphql
 * @param  {Object} app - express 的 app
 */
export default (app: any): void => {
  
  // https://www.apollographql.com/docs/apollo-server/whats-new/
  const server = new ApolloServer({
    debug: false,//config.debug,
    // schema,
    typeDefs: gql(typeDefs),
    resolvers,
    
    // https://www.apollographql.com/docs/apollo-server/data/errors/#gatsby-focus-wrapper
    formatError: (err: any) => {

      // 自定义一些错误
      if (err.message == "Context creation failed: invalid token") {
        return { message: "invalid token" }
      } else if (err.message == "Context creation failed: blocked") {
        return { message: "您的账号被禁止使用", blocked: true }
      }

      return err;
    },

    context: async ({ req, res }: any) => {

      // console.log(req.body.query.indexOf('mutation{'));

      // if (req.body && req.body.query && req.body.query.indexOf('mutation{')) {
      // }

      // 如果header中，包含access token，那么判断是否有效，无效则拒绝请求
      let token = req.headers.accesstoken || '';
      let role = req.headers.role || '';

      let user = null;
      
      if (token) {

        let result = await checkToken({ token, role });

        
        
        if (!result.user) {
          throw new AuthenticationError('invalid token'); 
        } else if (result.user.blocked) {
          throw new AuthenticationError('blocked'); 
        } else {
          user = result.user;
          role = result.role;
        }
    
      }

      // 获取客户端请求ip
      let ip;
      
      if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].toString().split(",")[0];
      } else {
        ip = req.connection.remoteAddress;
      }
      
      return {
        token,
        user,
        role,
        ip,
        req,
        res
      }
    },
    // persistedQueries: {
    //   cache: new MemcachedCache(
    //     ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
    //     { retries: 10, retry: 10000 }, // Options
    //   ),
    // },
    // https://www.apollographql.com/docs/apollo-server/features/caching/#saving-full-responses-to-a-cache
    plugins: [responseCachePlugin({
      sessionId: (requestContext: any) => {
        // 返回 null，表式不缓存

        const { role, user } = requestContext.context;

        // 未登录的用户，使用游客共享的缓存
        if (!user) return 'tourists';
        // 如果是管理员不进行缓存
        if (role == 'admin') return null;

        return null;
        // return requestContext.request.http.headers.get('accesstoken') ? null : 'tourists'
      }
    })],
    cacheControl: {
      // 是否显示请求头
      // calculateHttpHeaders: false,
      defaultMaxAge: config.cache.graphql
    },
    // https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html#Enabling-GraphQL-Playground-in-production
    introspection: true,//config.debug,
    playground: true//config.debug
  });

  server.applyMiddleware({ app, path: '/graphql' });
}
