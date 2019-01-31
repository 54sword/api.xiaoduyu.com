
import mongoose from 'mongoose';
import config from '../../config';
const { db_url } = config; 

// if (config.debug) {
// 	mongoose.set('debug', true);
// }

mongoose.connect(db_url, {
	useCreateIndex: true,
  useNewUrlParser: true
});

// mongoose.connect(db_url, {
  // useMongoClient: true,
// });

// promise.then(function(db) {
	// console.log('123123');
// })

// mongoose.createConnection(config.db_url, { useMongoClient: false }, function (error) {
// 	if (error) {
// 		console.error('connect to %s error: ', config.db_url, error.message);
// 		process.exit(1);
// 	}
// });

require('./user');
require('./account');
require('./oauth');
require('./comment');
require('./like');
require('./notification');
require('./user-notification');
require('./captcha');
require('./posts');
require('./topic');
require('./follow');
require('./token');
require('./phone');
require('./report');
require('./block');
require('./feed');
require('./message');



export const User = mongoose.model('User')
export const Account = mongoose.model('Account')
export const Oauth = mongoose.model('Oauth')
export const Captcha = mongoose.model('Captcha')
export const Token = mongoose.model('Token')
export const Phone = mongoose.model('Phone')
export const Report = mongoose.model('Report')
export const Posts = mongoose.model('Posts')
export const Comment = mongoose.model('Comment')
export const Topic = mongoose.model('Topic')
export const Follow = mongoose.model('Follow')
export const Like = mongoose.model('Like')
export const Notification = mongoose.model('Notification')
export const UserNotification = mongoose.model('UserNotification')
export const Block = mongoose.model('Block')
export const Feed = mongoose.model('Feed')
export const Message = mongoose.model('Message')

/*
const schemas = {
	User: mongoose.model('User'),
	Account: mongoose.model('Account'),
	Oauth: mongoose.model('Oauth'),
	Captcha: mongoose.model('Captcha'),
	Token: mongoose.model('Token'),
	Phone: mongoose.model('Phone'),
	Report: mongoose.model('Report'),
	Posts: mongoose.model('Posts'),
	Comment: mongoose.model('Comment'),
	Topic: mongoose.model('Topic'),
	Follow: mongoose.model('Follow'),
	Like: mongoose.model('Like'),
	Notification: mongoose.model('Notification'),
	UserNotification: mongoose.model('UserNotification'),
	Block: mongoose.model('Block'),
	Feed: mongoose.model('Feed'),
	Message: mongoose.model('Message')
}

export default schemas;
*/

/*
exports.User = mongoose.model('User');
exports.Account = mongoose.model('Account');
exports.Oauth = mongoose.model('Oauth');
exports.Captcha = mongoose.model('Captcha');
exports.Token = mongoose.model('Token');
exports.Phone = mongoose.model('Phone');
exports.Report = mongoose.model('Report');
exports.Posts = mongoose.model('Posts');
exports.Comment = mongoose.model('Comment');
exports.Topic = mongoose.model('Topic');
exports.Follow = mongoose.model('Follow');
exports.Like = mongoose.model('Like');
exports.Notification = mongoose.model('Notification');
exports.UserNotification = mongoose.model('UserNotification');
exports.Block = mongoose.model('Block');
exports.Feed = mongoose.model('Feed');
exports.Message = mongoose.model('Message');
*/