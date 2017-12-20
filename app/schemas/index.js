
var mongoose = require('mongoose');
var config = require('../../config');


if (config.debug) {
	// mongoose.set('debug', true);
}

/*
mongoose.Promise = global.Promise;
mongoose.connect(config.db_url, {}, function (error) {
	if (error) {
		console.error('connect to %s error: ', config.db_url, error.message);
		process.exit(1);
	}
});
*/

mongoose.Promise = global.Promise;

const promise = mongoose.connect(config.db_url, {
  useMongoClient: true,
})

promise.then(function(db) {
	// console.log('123123');
})

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
