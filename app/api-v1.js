
var express = require('express');

var user = require('./api/v1/user');
var account = require('./api/v1/account');
var commment = require('./api/v1/comment');
var like = require('./api/v1/like');
var UserNotification = require('./api/v1/user-notification');
var Captcha = require('./api/v1/captcha');
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
  router.get('/captcha-image', auth.openType, Captcha.showImage);

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
  router.post('/reset-avatar', auth.userRequired, user.resetAvatar);

  router.post('/add-posts', auth.userRequired, Posts.add);
  router.post('/update-posts', auth.userRequired, Posts.update);
  router.get('/posts', auth.openType, Posts.fetch);

  router.post('/write-comment', auth.userRequired, commment.add);
  router.post('/update-comment', auth.userRequired, commment.update);
  router.get('/comments', auth.openType, commment.fetch);

  router.get('/topic', auth.openType, Topic.fetch);
  router.post('/add-topic', auth.adminRequired, Topic.add);
  router.post('/update-topic', auth.adminRequired, Topic.update);

  router.post('/like', auth.userRequired, like.add);
  router.post('/unlike', auth.userRequired, like.unlike);

  router.get('/follow', auth.openType, Follow.fetch);
  router.post('/add-follow', auth.userRequired, Follow.add);
  router.post('/remove-follow', auth.userRequired, Follow.remove);

  router.post('/notifications', auth.userRequired, UserNotification.fetch);
  router.get('/unread-notifications', auth.userRequired, UserNotification.fetchUnreadCount);

  router.post('/get-qiniu-token', auth.userRequired, QiNiu.getToken);

  // 解除绑定
  router.post('/unbinding-qq', auth.userRequired, qq.unbinding);
  router.post('/unbinding-weibo', auth.userRequired, weibo.unbinding);

  return router;
};

module.exports = APIRequire;
