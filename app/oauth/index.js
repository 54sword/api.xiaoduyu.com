
import express from 'express'
import qq from './qq'
import weibo from './weibo'
import github from './github'
import wechat from './wechat'
import wechatPC from './wechat-pc'
import { oauth } from '../../config'

const OauthRouter = (csrfProtection) => {

  const router = express.Router();

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

export default OauthRouter
