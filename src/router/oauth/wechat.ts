import request from 'request'
import uuid from 'node-uuid'

import To from '../../utils/to'
import config from '../../../config'
import OauthClass from './oauth.class'

class GithubClass extends OauthClass {
  signInCallback() {
    return async (req: any, res: any, next: any)=>{

      var user = null;
      var code = req.query.code;
      var state = req.query.state;
      var user_access_token = req.cookies['access_token']; //req.session.access_token;
      
      // 避免csrf攻击
      if (req.cookies['csrf'] != state) {
        res.redirect(this.signInUrl);
        return;
      }

      if (user_access_token) {
        user = await this.checkAccessToken(user_access_token);
        if (!user) {
          this.goToNoticePage(req, res, 'wrong_token');
          return;
        } 
      }

      let err, result, userinfo, userId;

      // 获取第三放的访问令牌
      [ err, result ] = await To(this.getAccessToken(code));

      if (err) {
        this.goToNoticePage(req, res, 'wrong_token');
        return;
      }

      if (!result) {
        res.redirect(this.redirectUri)
        return;
      }

      // 获取open id
      [ err, userinfo ] = await To(this.getUserinfo(result.access_token, result.unionid));

      let socialInfo: any = {
        nickname: userinfo.nickname,
        avatar: userinfo.headimgurl || '',
        gender: userinfo.sex == 1 ? 1 : 0,
        access_token: uuid.v4()
      };
      
      let socialAccessToken: any = {
        openid: result.unionid,
        access_token: result.access_token,
        expires_in: result.expires_in,
        refresh_token: result.refresh_token
      };

      [ err, userId ] = await To(this.handle({
        userId: user ? user._id : '',
        socialAccessToken,
        socialInfo,
        source: this.name
      }));

      if (err || !userId) {
        this.goToNoticePage(req, res, err);
      } else {
        this.goToAutoSignin(req, res, userId);
      }

    }
  }

  // 获取 access token
  getAccessToken(code: string) {
    return new Promise((resolve, reject)=>{

      request.get(
        'https://api.weixin.qq.com/sns/oauth2/access_token?'+
        'appid='+this.appid+
        '&secret='+this.appkey+
        '&code='+code+
        '&grant_type=authorization_code',
        {},
        function (error: any, response: any, body: any) {
          if (body) body = JSON.parse(body);

          if (body && !body.errcode) {
            resolve(body)
          } else {
            reject(body.errcode)
          }

        }
      );

    })
  }

  getUserinfo(access_token: string, openid: string) {
    return new Promise((resolve, reject)=>{

      request.get(
        'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
        {},
        function (error: any, response: any, body: any) {

          // console.log(response);

          // {"errcode":40001,"errmsg":"invalid credential, access_token is invalid or not latest, hints: [ req_id: MJbACoLoRa-CktJaA ]"}
          // console.log(body);

          if (body) body = JSON.parse(body);
          // callback(body && !body.errcode ? body : null);

          if (body && !body.errcode) {
            resolve(body)
          } else {
            reject(body.errcode)
          }

        }
      );

    })
  }
}

let wechat = new GithubClass({
  name: 'wechat',
  signInUrl: config.domain+'/oauth/wechat',
  appid: config.oauth.wechat.appid,
  appkey: config.oauth.wechat.appkey,
  redirectUri: config.domain+'/oauth/wechat-signin',
  scope: 'snsapi_userinfo',
  redirectSignInUri: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid={appid}&redirect_uri={redirectUri}&response_type=code&scope={scope}&state={csrf}#wechat_redirect'
});

let wechatPC = new GithubClass({
  name: 'wechat',
  signInUrl: config.domain+'/oauth/wechat-pc',
  appid: config.oauth.wechatPC.appid,
  appkey: config.oauth.wechatPC.appkey,
  redirectUri: config.domain+'/oauth/wechat-pc-signin',
  scope: 'snsapi_login',
  redirectSignInUri: 'https://open.weixin.qq.com/connect/qrconnect?appid={appid}&redirect_uri={redirectUri}&response_type=code&scope={scope}&state={csrf}#wechat_redirect'
});

// 重定向到第三方验证页面
export const signIn = wechat.redirectSignIn()
export const signInCallback = wechat.signInCallback()

export const PC_signIn = wechatPC.redirectSignIn()
export const PC_signInCallback = wechatPC.signInCallback()