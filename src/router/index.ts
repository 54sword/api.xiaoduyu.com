import express from 'express'
import * as captcha from './captcha'
import * as weibo from './oauth/weibo'
import * as qq from './oauth/qq'
import * as github from './oauth/github'
import * as wechat from './oauth/wechat'

import config from '../../config'

const { debug, oauth } = config

export default () => {

  const router = express.Router()

  router.get('/', (req, res)=>{
    let text = `API服务运行中...${debug ? '<br /><a href="/graphql">GraphQL API文档(开发环境会打开，线上环境会关闭)</a>' : ''}`
    res.send(text);
  })
  
  router.get('/captcha/:id', captcha.showImage)
  
  if (oauth.weibo.appid) {
    router.get('/oauth/weibo', weibo.signIn)
    router.get('/oauth/weibo-signin', weibo.signInCallback)
  }

  if (oauth.qq.appid) {
    router.get('/oauth/qq', qq.signIn)
    router.get('/oauth/qq-signin', qq.signInCallback)
  }

  if (oauth.github.appid) {
    router.get('/oauth/github', github.signIn)
    router.get('/oauth/github-signin', github.signInCallback)
  }

  if (oauth.wechat.appid) {
    router.get('/oauth/wechat', wechat.signIn)
    router.get('/oauth/wechat-signin', wechat.signInCallback)
  }

  if (oauth.wechatPC.appid) {
    router.get('/oauth/wechat-pc', wechat.PC_signIn)
    router.get('/oauth/wechat-pc-signin', wechat.PC_signInCallback)
  }

  return router
}
