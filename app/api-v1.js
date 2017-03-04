
var express = require('express');

var user = require('./api/v1/user');
var account = require('./api/v1/account');
// var question = require('./api/v1/question');
// var answer = require('./api/v1/answer');
var commment = require('./api/v1/comment');
// var node = require('./api/v1/node');
var avatar = require('./api/v1/avatar');
// var nodeFollow = require('./api/v1/node-follow');
// var userFollow = require('./api/v1/user-follow');
var like = require('./api/v1/like');
var UserNotification = require('./api/v1/user-notification');
// var FollowQuestion = require('./api/v1/follow-question');
var Captcha = require('./api/v1/captcha');
// var Image = require('./api/v1/image');
var QiNiu = require('./api/v1/qiniu');

var Posts = require('./api/v1/posts');
var Topic = require('./api/v1/topic');
var Follow = require('./api/v1/follow');

var qq = require('./oauth/qq');
var weibo = require('./oauth/weibo');

var auth = require('./api/v1/middlewares/auth');

var APIRequire = function() {

  var router = express.Router();

  router.post('/user', auth.userRequired, user.fetch);

  router.get('/people/:id', auth.openType, user.fetchById);

  router.post('/get-captcha', auth.openType, Captcha.add);

  router.post('/signin', account.signin);
  router.post('/signup', account.signup);
  router.post('/signup-email-verify', account.signupEmailVerify);

  router.post('/send-email-verify-captcha', auth.userRequired, account.sendEmailVerifyCaptcha);
  router.post('/check-email-verify-captcha', auth.userRequired, account.checkEmailVerifyCaptcha);
  router.post('/check-email-and-send-verify-captcha', auth.userRequired, account.checkEmailAndSendVerifyCaptcha);
  router.post('/reset-email', auth.userRequired, account.resetEmail);
  router.post('/send-captcha-to-mailbox', account.sendEmailCaptcha);
  router.post('/reset-password-by-captcha', account.resetPasswordByCaptcha);
  router.post('/binding-email', auth.userRequired, account.bindingEmail);

  router.post('/reset-password', auth.userRequired, account.resetPassword);
  router.post('/reset-nickname', auth.userRequired, user.resetNickname);
  router.post('/reset-gender', auth.userRequired, user.resetGender);
  router.post('/reset-brief', auth.userRequired, user.resetBrief);
  router.post('/upload-avatar', auth.userRequired, avatar.upload);
  router.post('/crop-avatar', auth.userRequired, avatar.crop);

  // router.post('/write-question', auth.userRequired, question.add);
  // router.post('/update-question', auth.userRequired, question.update);
  // router.get('/questions', auth.openType, question.fetcha);
  // router.get('/question/:id', question.fetchById);

  router.post('/add-posts', auth.userRequired, Posts.add);
  router.post('/update-posts', auth.userRequired, Posts.update);
  router.get('/posts', auth.openType, Posts.fetch);

  router.post('/write-comment', auth.userRequired, commment.add);
  router.post('/update-comment', auth.userRequired, commment.update);
  router.get('/comments', auth.openType, commment.fetch);

  router.get('/topic', auth.openType, Topic.fetch);
  router.post('/add-topic', auth.adminRequired, Topic.add);
  router.post('/update-topic', auth.adminRequired, Topic.update);

  // router.post('/write-answer', auth.userRequired, answer.add);
  // router.post('/update-answer', auth.userRequired, answer.update);
  // router.get('/answers', auth.openType, answer.fetch);
  // router.get('/answer/:id', answer.fetchById);

  // router.post('/buy-answer', auth.userRequired, answer.buy);
  // router.get('/nodes', auth.openType, node.fetch);
  // router.post('/add-node', auth.adminRequired, node.add);
  // router.post('/update-node', auth.adminRequired, node.update);
  // router.get('/node/:id', node.fetchById);

  router.post('/like', auth.userRequired, like.add);
  router.post('/unlike', auth.userRequired, like.unlike);

  // follow node
  // router.post('/fetch-all-follow-nodes', auth.userRequired, nodeFollow.fetchAllFollowNodes);
  // router.post('/follow-node/:id', auth.userRequired, nodeFollow.follow);
  // router.post('/unfollow-node/:id', auth.userRequired, nodeFollow.unfollow);
  // router.get('/fetch-follow-nodes', auth.openType, nodeFollow.fetchByUserId);
  
  router.get('/follow', auth.openType, Follow.fetch);
  router.post('/add-follow', auth.userRequired, Follow.add);
  router.post('/remove-follow', auth.userRequired, Follow.remove);

  // follow user
  // router.get('/fetch-all-follow-peoples', auth.userRequired, userFollow.fetchAllFollowPeoples);
  // router.post('/follow-user/:id', auth.userRequired, userFollow.follow);
  // router.post('/unfollow-user/:id', auth.userRequired, userFollow.unfollow);
  // router.get('/fetch-follow-peoples', auth.openType, userFollow.fetchByUserId);
  // router.get('/fetch-fans', auth.openType, userFollow.fetchByFollowId);

  router.post('/notifications', auth.userRequired, UserNotification.fetch);
  router.get('/unread-notifications', auth.userRequired, UserNotification.fetchUnreadCount);

  // router.post('/follow-question', auth.userRequired, FollowQuestion.follow);
  // router.post('/cancel-follow-question', auth.userRequired, FollowQuestion.cancelFollow);

  // router.post('/upload-image', auth.userRequired, Image.update);
  router.post('/get-qiniu-token', auth.userRequired, QiNiu.getToken);

  //==============================================

  // oauth 登录
  /*
  router.get('/oauth/weibo', Oauth.weibo.show);
  router.get('/oauth/qq', Oauth.qq.show);
  // 登录创建账户或绑定账户
  router.get('/oauth/weibo-signin', Oauth.weibo.signin);
  router.get('/oauth/qq-signin', Oauth.qq.signin);
  */

  // 解除绑定
  router.post('/unbinding-qq', auth.userRequired, qq.unbinding);
  router.post('/unbinding-weibo', auth.userRequired, weibo.unbinding);

  return router;
};

module.exports = APIRequire;
