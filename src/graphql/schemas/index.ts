import * as Posts from './posts';
import * as Topic from './topic';
import * as User from './user';
import * as Comment from './comment';
import * as UserNotification from './user-notification';
import * as Notification from './notification';
import * as Captcha from './captcha';
import * as Account from './account';
import * as Qiniu from './qiniu';
import * as Block from './block';
import * as Countries from './countries';
import * as Follow from './follow';
import * as Like from './like';
import * as Password from './password';
import * as Phone from './phone';
import * as Forgot from './forgot';
import * as Oauth from './oauth';
import * as Report from './report';
import * as UnlockToken from './unlock-token';
import * as Token from './token';
import * as Feed from './feed';
import * as Message from './message';

// console.log(Posts.Mutation);

const typeDefs = [ `

  ${Posts.Schema}
  ${Topic.Schema}
  ${User.Schema}
  ${Comment.Schema}
  ${UserNotification.Schema}
  ${Notification.Schema}
  ${Captcha.Schema}
  ${Account.Schema}
  ${Qiniu.Schema}
  ${Block.Schema}
  ${Countries.Schema}
  ${Follow.Schema}
  ${Like.Schema}
  ${Password.Schema}
  ${Phone.Schema}
  ${Forgot.Schema}
  ${Oauth.Schema}
  ${Report.Schema}
  ${UnlockToken.Schema}
  ${Token.Schema}
  ${Feed.Schema}
  ${Message.Schema}

  # 查询
  type Query {
    ${Posts.Query}
    ${Topic.Query}
    ${User.Query}
    ${Comment.Query}
    ${UserNotification.Query}
    ${Notification.Query}
    ${Captcha.Query}
    ${Account.Query}
    ${Qiniu.Query}
    ${Block.Query}
    ${Countries.Query}
    ${Follow.Query}
    ${Like.Query}
    ${Password.Query}
    ${Phone.Query}
    ${Forgot.Query}
    ${Oauth.Query}
    ${Report.Query}
    ${UnlockToken.Query}
    ${Token.Query}
    ${Feed.Query}
    ${Message.Query}
  }

  # 增、删、改
  type Mutation {
    ${Posts.Mutation}
    ${Topic.Mutation}
    ${User.Mutation}
    ${Comment.Mutation}
    ${UserNotification.Mutation}
    ${Notification.Mutation}
    ${Captcha.Mutation}
    ${Account.Mutation}
    ${Qiniu.Mutation}
    ${Block.Mutation}
    ${Countries.Mutation}
    ${Follow.Mutation}
    ${Like.Mutation}
    ${Password.Mutation}
    ${Phone.Mutation}
    ${Forgot.Mutation}
    ${Oauth.Mutation}
    ${Report.Mutation}
    ${UnlockToken.Mutation}
    ${Token.Mutation}
    ${Feed.Mutation}
    ${Message.Mutation}
  }

  schema {
    mutation: Mutation
    query: Query
  }

`];

export default typeDefs;
