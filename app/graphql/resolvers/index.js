import posts from './posts';
import topic from './topic';
import user from './user';
import comment from './comment';
import userNotification from './user-notification';
import notification from './notification';
import captcha from './captcha';
import account from './account';
import qiniu from './qiniu';
import block from './block';
import countries from './countries';
import follow from './follow';
import like from './like';
import password from './password';
import phone from './phone';
import forgot from './forgot';
import oauth from './oauth';
import report from './report';
import unlockToken from './unlock-token';
import Token from './token';
import Feed from './feed';

let Query = {};
let Mutation = {};

Object.assign(Query, posts.query);
Object.assign(Query, topic.query);
Object.assign(Query, user.query);
Object.assign(Query, comment.query);
Object.assign(Query, userNotification.query);
Object.assign(Query, notification.query);
Object.assign(Query, captcha.query);
Object.assign(Query, account.query);
Object.assign(Query, qiniu.query);
Object.assign(Query, block.query);
Object.assign(Query, countries.query);
Object.assign(Query, follow.query);
Object.assign(Query, oauth.query);
Object.assign(Query, report.query);
Object.assign(Query, unlockToken.query);
Object.assign(Query, Token.query);
Object.assign(Query, Feed.query);

Object.assign(Mutation, posts.mutation);
Object.assign(Mutation, topic.mutation);
Object.assign(Mutation, user.mutation);
Object.assign(Mutation, comment.mutation);
Object.assign(Mutation, userNotification.mutation);
Object.assign(Mutation, notification.mutation);
Object.assign(Mutation, captcha.mutation);
Object.assign(Mutation, account.mutation);
Object.assign(Mutation, qiniu.mutation);
Object.assign(Mutation, block.mutation);
Object.assign(Mutation, countries.mutation);
Object.assign(Mutation, follow.mutation);
Object.assign(Mutation, like.mutation);
Object.assign(Mutation, password.mutation);
Object.assign(Mutation, phone.mutation);
Object.assign(Mutation, forgot.mutation);
Object.assign(Mutation, oauth.mutation);
Object.assign(Mutation, report.mutation);
Object.assign(Mutation, unlockToken.mutation);
Object.assign(Mutation, Token.mutation);
Object.assign(Mutation, Feed.mutation);

var resolvers = {
  Query,
  Mutation
}

Object.assign(resolvers, posts.resolvers);
Object.assign(resolvers, topic.resolvers);
Object.assign(resolvers, user.resolvers);
Object.assign(resolvers, comment.resolvers);
Object.assign(resolvers, userNotification.resolvers);
Object.assign(resolvers, notification.resolvers);
Object.assign(resolvers, captcha.resolvers);
Object.assign(resolvers, account.resolvers);
Object.assign(resolvers, qiniu.resolvers);
Object.assign(resolvers, block.resolvers);
Object.assign(resolvers, countries.resolvers);
Object.assign(resolvers, follow.resolvers);
Object.assign(resolvers, like.resolvers);
Object.assign(resolvers, password.resolvers);
Object.assign(resolvers, phone.resolvers);
Object.assign(resolvers, forgot.resolvers);
Object.assign(resolvers, oauth.resolvers);
Object.assign(resolvers, report.resolvers);
Object.assign(resolvers, unlockToken.resolvers);
Object.assign(resolvers, Token.resolvers);
Object.assign(resolvers, Feed.resolvers);

export default resolvers
