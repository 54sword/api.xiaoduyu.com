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
      [ err, userinfo ] = await To(this.getUserinfo(result.access_token, result.uid));

      let socialInfo: any = {
        nickname: userinfo.screen_name,
        avatar: userinfo.avatar_hd || '',
        gender: (userinfo.gender === 'm' ? 1 : 0),
        access_token: uuid.v4()
      };

      let socialAccessToken: any = {
        openid: result.uid,
        access_token: result.access_token,
        expires_in: result.expires_in
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
    return new Promise((resolve, rejects)=>{

      request.post(
        'https://api.weibo.com/oauth2/access_token?client_id='+this.appid+'&client_secret='+this.appkey+'&grant_type=authorization_code&redirect_uri='+encodeURIComponent(this.redirectUri)+'&code='+code,
        {},
        function (error: any, response: any, body: any) {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            resolve(info);
          } else {
            rejects(error);
          }
        }
      );

    })
  }

  getUserinfo(access_token: string, uid: string) {
    return new Promise((resolve, reject)=>{

      request.get(
        'https://api.weibo.com/2/users/show.json?access_token='+access_token+'&uid='+uid+'&source='+this.appid,
        {},
        function (error: any, response: any, body: any) {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            resolve(info);
          } else {
            reject(null);
          }
        }
      )

    })
  }

}

let weibo = new GithubClass({
  name: 'weibo',
  signInUrl: config.domain+'/oauth/weibo',
  appid: config.oauth.weibo.appid+'',
  appkey: config.oauth.weibo.appSecret,
  redirectUri: config.domain+'/oauth/weibo-signin',
  scope: 'user',
  redirectSignInUri: 'https://api.weibo.com/oauth2/authorize?response_type=code&state={csrf}&client_id={appid}&redirect_uri={redirectUri}&scope={scope}'
});

// 重定向到第三方验证页面
export const signIn = weibo.redirectSignIn()
export const signInCallback = weibo.signInCallback()