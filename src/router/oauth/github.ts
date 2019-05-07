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
      [ err, result ] = await To(this.getAccessToken(code, state));

      if (err) {
        this.goToNoticePage(req, res, 'wrong_token');
        return;
      }

      if (!result) {
        res.redirect(this.redirectUri)
        return;
      }

      // 获取open id
      [ err, userinfo ] = await To(this.getUserinfo(req, result.access_token));

      let socialInfo: any = {
        nickname: userinfo.name || userinfo.login,
        avatar: userinfo.avatar_url || '',
        access_token: uuid.v4()
      };

      let socialAccessToken: any = {
        openid: userinfo.id,
        access_token: result.access_token
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
  getAccessToken(code: string, state: string) {
    return new Promise((resolve, rejects)=>{

      request.post('https://github.com/login/oauth/access_token', {
        form: {
          client_id: this.appid,
          client_secret: this.appkey,
          code: code,
          redirect_uri: this.redirectUri,
          state: state
        }
      }, function(err: any, response: any, body: any){
  
        if (err || response.statusCode != 200) {
          // 获取失败
          // callback(err || response.statusCode, null);
          rejects(err || response.statusCode);
          return;
        }
  
        var params: any = {};
        var str = body;
        var strs = str.split("&");
  
        for (var i = 0, max = strs.length; i < max; i++) {
          var a = strs[i].split("=");
          params[a[0]] = a[1];
        }

        if (params['error']) {
          rejects(params)
          return
        }
  
        resolve(params);

        // callback(null, params);
      })

    })
  }

  getUserinfo(req: any, access_token: string) {
    return new Promise((resolve, reject)=>{

      var options = {
        url: 'https://api.github.com/user?access_token='+access_token,
        headers: {
          'Accept': 'application/json',
          'User-Agent': req.headers['user-agent']
        }
      };
    
      request.get(options, function (error: any, response: any, body: any) {
    
        body = JSON.parse(body)

        if (body && body.id) {
          resolve(body)
        } else if (body.message) {
          reject(body.message)
        } else {
          reject(error)
        }

      })

    })
  }

}

let github = new GithubClass({
  name: 'github',
  signInUrl: config.domain+'/oauth/github',
  appid: config.oauth.github.appid,
  appkey: config.oauth.github.appkey,
  redirectUri: config.domain+'/oauth/github-signin',
  scope: 'user',
  redirectSignInUri: 'http://github.com/login/oauth/authorize?client_id={appid}&scope={scope}&state={csrf}&redirect_uri={redirectUri}'
});


// 重定向到第三方验证页面
export const signIn = github.redirectSignIn()
export const signInCallback = github.signInCallback()