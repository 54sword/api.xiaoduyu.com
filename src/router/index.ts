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
    let text = `
      <p>API服务运行中...</p>
      ${debug ? '<p><a href="/graphql">GraphQL API文档（线上环境会关闭）</a></p>' : ''}

      <p>文档额外补充信息</p>
      <ul>
        <li>如何设置管理员，在数据库中设置用户role属性等于100</li>
        <li>
          GraphQL API，headers可以包含两个参数AccessToken、Role
          <ul>
            <li>[选填] AccessToken 登录用户的访问令牌，通过文档中 signIn 可以获取到</li>
            <li>[选填] Role 用户角色，Role=admin 表示使用API中管理员的权限，注意附带的AccessToken用户，role需要等于100</li>
          </ul>
        </li>
      </ul>
    `
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
