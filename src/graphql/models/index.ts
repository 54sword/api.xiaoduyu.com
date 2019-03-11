
import * as account from './account'
import * as block from './block'
import * as captcha from './captcha'
import * as comment from './comment'
import * as countries from './countries'
import * as feed from './feed'
import * as follow from './follow'
import * as forgot from './forgot'
import * as like from './like'
import * as notification from './notification'
import * as oauth from './oauth'
import * as password from './password'
import * as phone from './phone'
import * as posts from './posts'
import * as qiniu from './qiniu'
import * as report from './report'
import * as token from './token'
import * as topic from './topic'
import * as unlockToken from './unlock-token'
import * as user from './user'
import * as userNotification from './user-notification'
import * as message from './message'
import * as session from './session'

export const typeDefs = [ `

  ${account.typedefs.Schema}
  ${block.typedefs.Schema}
  ${captcha.typedefs.Schema}
  ${comment.typedefs.Schema}
  ${countries.typedefs.Schema}
  ${feed.typedefs.Schema}
  ${follow.typedefs.Schema}
  ${forgot.typedefs.Schema}
  ${like.typedefs.Schema}
  ${notification.typedefs.Schema}
  ${oauth.typedefs.Schema}
  ${password.typedefs.Schema}
  ${phone.typedefs.Schema}
  ${posts.typedefs.Schema}
  ${qiniu.typedefs.Schema}
  ${report.typedefs.Schema}
  ${token.typedefs.Schema}
  ${topic.typedefs.Schema}
  ${unlockToken.typedefs.Schema}
  ${user.typedefs.Schema}
  ${userNotification.typedefs.Schema}
  ${message.typedefs.Schema}
  ${session.typedefs.Schema}

  # 查询
  type Query {
    ${account.typedefs.Query}
    ${block.typedefs.Query}
    ${captcha.typedefs.Query}
    ${comment.typedefs.Query}
    ${countries.typedefs.Query}
    ${feed.typedefs.Query}
    ${follow.typedefs.Query}
    ${forgot.typedefs.Query}
    ${like.typedefs.Query}
    ${notification.typedefs.Query}
    ${oauth.typedefs.Query}
    ${password.typedefs.Query}
    ${phone.typedefs.Query}
    ${posts.typedefs.Query}
    ${qiniu.typedefs.Query}
    ${report.typedefs.Query}
    ${token.typedefs.Query}
    ${topic.typedefs.Query}
    ${unlockToken.typedefs.Query}
    ${user.typedefs.Query}
    ${userNotification.typedefs.Query}
    ${message.typedefs.Query}
    ${session.typedefs.Query}
  }

  # 增、删、改
  type Mutation {
    ${account.typedefs.Mutation}
    ${block.typedefs.Mutation}
    ${captcha.typedefs.Mutation}
    ${comment.typedefs.Mutation}
    ${countries.typedefs.Mutation}
    ${feed.typedefs.Mutation}
    ${follow.typedefs.Mutation}
    ${forgot.typedefs.Mutation}
    ${like.typedefs.Mutation}
    ${notification.typedefs.Mutation}
    ${oauth.typedefs.Mutation}
    ${password.typedefs.Mutation}
    ${phone.typedefs.Mutation}
    ${posts.typedefs.Mutation}
    ${qiniu.typedefs.Mutation}
    ${report.typedefs.Mutation}
    ${token.typedefs.Mutation}
    ${topic.typedefs.Mutation}
    ${unlockToken.typedefs.Mutation}
    ${user.typedefs.Mutation}
    ${userNotification.typedefs.Mutation}
    ${message.typedefs.Mutation}
    ${session.typedefs.Mutation}
  }

  schema {
    mutation: Mutation
    query: Query
  }

`]

export const resolvers = {
  // 查询
  Query: {
    ...account.resolvers.query,
    ...block.resolvers.query,
    ...captcha.resolvers.query,
    ...comment.resolvers.query,
    ...countries.resolvers.query,
    ...feed.resolvers.query,
    ...follow.resolvers.query,
    ...forgot.resolvers.query,
    ...like.resolvers.query,
    ...notification.resolvers.query,
    ...oauth.resolvers.query,
    ...password.resolvers.query,
    ...phone.resolvers.query,
    ...posts.resolvers.query,
    ...qiniu.resolvers.query,
    ...report.resolvers.query,
    ...token.resolvers.query,
    ...topic.resolvers.query,
    ...unlockToken.resolvers.query,
    ...user.resolvers.query,
    ...userNotification.resolvers.query,
    ...message.resolvers.query,
    ...session.resolvers.query
  },
  // 修改
  Mutation: {
    ...account.resolvers.mutation,
    ...block.resolvers.mutation,
    ...captcha.resolvers.mutation,
    ...comment.resolvers.mutation,
    ...countries.resolvers.mutation,
    ...feed.resolvers.mutation,
    ...follow.resolvers.mutation,
    ...forgot.resolvers.mutation,
    ...like.resolvers.mutation,
    ...notification.resolvers.mutation,
    ...oauth.resolvers.mutation,
    ...password.resolvers.mutation,
    ...phone.resolvers.mutation,
    ...posts.resolvers.mutation,
    ...qiniu.resolvers.mutation,
    ...report.resolvers.mutation,
    ...token.resolvers.mutation,
    ...topic.resolvers.mutation,
    ...unlockToken.resolvers.mutation,
    ...user.resolvers.mutation,
    ...userNotification.resolvers.mutation,
    ...message.resolvers.mutation,
    ...session.resolvers.mutation
  }
}