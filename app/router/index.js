import express from 'express';

// router
import captcha from './captcha';
import weibo from './oauth/weibo';
import qq from './oauth/qq';
import github from './oauth/github';
import wechat from './oauth/wechat';
import wechatPC from './oauth/wechat-pc';

import { oauth } from '../../config';

module.exports = () => {

  const router = express.Router();

  router.get('/', (req, res)=>{
    res.send('API服务运行中...');
  });
  
  router.get('/captcha/:id', captcha.showImage);
  
  if (oauth.weibo) {
    router.get('/weibo', weibo.show);
    router.get('/weibo-signin', weibo.signin);
  }

  if (oauth.qq) {
    router.get('/qq', qq.show);
    router.get('/qq-signin', qq.signin);
  }

  if (oauth.github) {
    router.get('/github', github.show);
    router.get('/github-signin', github.signin);
  }

  if (oauth.wechat) {
    router.get('/wechat', wechat.show);
    router.get('/wechat-signin', wechat.signin);
  }

  if (oauth.wechatPC) {
    router.get('/wechat-pc', wechatPC.show);
    router.get('/wechat-pc-signin', wechatPC.signin);
  }

  return router;
}
