
var mongoose = require('mongoose');
var config = require('../../configs/config');

if (config.debug) {
	mongoose.set('debug', true);
}

mongoose.connect(config.db_url, function (error) {
	if (error) {
		console.error('connect to %s error: ', config.db_url, error.message);
		process.exit(1);
	}
});

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

exports.User = mongoose.model('User');
exports.Account = mongoose.model('Account');
exports.Oauth = mongoose.model('Oauth');
exports.Captcha = mongoose.model('Captcha');

exports.Posts = mongoose.model('Posts');
exports.Comment = mongoose.model('Comment');
exports.Topic = mongoose.model('Topic');
exports.Follow = mongoose.model('Follow');
exports.Like = mongoose.model('Like');
exports.Notification = mongoose.model('Notification');
exports.UserNotification = mongoose.model('UserNotification');
