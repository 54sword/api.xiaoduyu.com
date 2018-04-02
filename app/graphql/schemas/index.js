import Posts from './posts';
import Topic from './topic';
import User from './user';
import Comment from './comment';
import UserNotification from './user-notification';
import Notification from './notification';
import Captcha from './captcha';
import Account from './account';
import Qiniu from './qiniu';
import Block from './block';
import Countries from './countries';
import Follow from './follow';
import Like from './like';
import Password from './password';

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
  }

  schema {
    mutation: Mutation
    query: Query
  }

`];

export default typeDefs;
