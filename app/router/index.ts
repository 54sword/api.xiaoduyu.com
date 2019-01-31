import express from 'express';

// router
import * as captcha from './captcha';
import * as weibo from './oauth/weibo';
import * as qq from './oauth/qq';
import { githubSignIn, githubSignInCallback } from './oauth/github';
import * as wechat from './oauth/wechat';
import * as wechatPC from './oauth/wechat-pc';

// import { oauth } from '../../config';
import config from '../../config';
// const { oauth } = config;

const { oauth } = config;

// import './oauth/show';

console.log(weibo);

module.exports = () => {

  const router = express.Router();

  router.get('/', (req, res)=>{
    res.send('API服务运行中...');
  });
  
  router.get('/captcha/:id', captcha.showImage);
  
  if (oauth.weibo) {
    router.get('/oauth/weibo', weibo.show);
    router.get('/oauth/weibo-signin', weibo.signin);
  }

  if (oauth.qq) {
    router.get('/oauth/qq', qq.show);
    router.get('/oauth/qq-signin', qq.signin);
  }

  if (oauth.github) {
    router.get('/oauth/github', githubSignIn);
    router.get('/oauth/github-signin', githubSignInCallback);
  }

  if (oauth.wechat) {
    router.get('/oauth/wechat', wechat.show);
    router.get('/oauth/wechat-signin', wechat.signin);
  }

  if (oauth.wechatPC) {
    router.get('/oauth/wechat-pc', wechatPC.show);
    router.get('/oauth/wechat-pc-signin', wechatPC.signin);
  }

  return router;
}
