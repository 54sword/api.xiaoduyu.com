
var express = require('express');

var qq = require('./qq');
var weibo = require('./weibo');

var OauthRouter = function(csrfProtection) {

  var router = express.Router();

  router.get('/weibo', weibo.show);
  router.get('/qq', qq.show);
  // 登录创建账户或绑定账户
  router.get('/weibo-signin', weibo.signin);
  router.get('/qq-signin', qq.signin);

  // router.post('/unbinding-weibo', weibo.unbinding);
  // router.post('/unbinding-qq', qq.unbinding);

  return router;
}


module.exports = OauthRouter;
