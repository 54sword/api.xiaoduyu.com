import request from 'request'
import uuid from 'node-uuid'

import To from '../../utils/to'
import config from '../../../config'
import OauthClass from './oauth.class'


interface signIn{
  ip: string,
  user?: {
    _id: string
  }
  token: {
    openid: string
    access_token: string
    expires_in: number
    refresh_token?: string
    oauth_consumer_key?: string
  }
}

class QQClass extends OauthClass {
  /**
   * web，登陆、注册、绑定
   */
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

      let err, result, userinfo, userId, openid;

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

      [ err, openid ] = await To(this.getOpenId(result.access_token));

      // 获取open id
      [ err, userinfo ] = await To(this.getUserinfo(result.access_token, openid));

      let socialInfo: any = {
        nickname: userinfo.nickname,
        avatar: userinfo.figureurl_qq_2,
        gender: userinfo.gender == '男' ? 1 : 0,
        access_token: uuid.v4()
      };

      let socialAccessToken: any = {
        openid: openid,
        access_token: result.access_token,
        expires_in: result.expires_in,
        refresh_token: result.refresh_token || ''
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

  /**
   * app客户端，登陆、注册、绑定
   */
  signIn() {

    return (data: signIn) => {

      return new Promise(async (resolve, reject)=>{
  
        const { ip, user, token } = data;
  
        let  err, userinfo, userId;
  
        // 获取用户的信息
        [ err, userinfo ] = await To(this.getUserinfo(token.access_token, token.openid, token.oauth_consumer_key));
        
        let socialInfo: any = {
          nickname: userinfo.nickname,
          avatar: userinfo.figureurl_qq_2,
          gender: userinfo.gender == '男' ? 1 : 0,
          access_token: uuid.v4()
        };
  
        let socialAccessToken: any = {
          openid: token.openid,
          access_token: token.access_token,
          expires_in: token.expires_in,
          refresh_token: token.refresh_token || ''
        };
  
        [ err, userId ] = await To(this.handle({
          userId: user ? user._id : '',
          socialAccessToken,
          socialInfo,
          source: this.name
        }));

        if (err && err == 'binding_finished') {
          resolve(true);
        } else if (err || !userId) {
          reject(err);
        } else {
          if (user) {
            resolve(true);
          } else {
            let token = await this.createAccessToken(ip, userId);
            resolve(token);
          }
        }
  
      })

    }

  }

  // 获取 access token
  getAccessToken(code: string, state: string) {
    return new Promise((resolve, rejects)=>{

      request.get(
        'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='+this.appid+'&client_secret='+this.appkey+'&code='+code+'&redirect_uri='+encodeURIComponent(this.redirectUri),
        {},
        function (error: any, response: any, body: any) {
          if (error || response.statusCode != 200) {
            // 获取失败
            rejects(error || response.statusCode);
            return;
          }
    
          var params: any = {};
          var str = body;
          var strs = str.split("&");
    
          for (var i = 0, max = strs.length; i < max; i++) {
            var a = strs[i].split("=");
            params[a[0]] = a[1];
          }
    
          resolve(params);
        }
      )

    })
  }

  getOpenId(access_token: string) {
    return new Promise((resolve, reject)=>{

      request.get(
        'https://graph.qq.com/oauth2.0/me?access_token='+access_token,
        {},
        function (error: any, response: any, body: any) {
          if (!error && response.statusCode == 200) {
    
            var star = body.indexOf('(')+1;
            var end = body.lastIndexOf(')');
            var body = body.substring(star, end);
            var info = JSON.parse(body);
    
            if (info.openid) {
              resolve(info.openid);
            } else {
              reject('openid get failed');
            }
    
          } else {
            reject(error || response.statusCode);
          }
        }
      )

    })
  }

  getUserinfo(access_token: string, openid: string, oauth_consumer_key?: string) {
    return new Promise((resolve, reject)=>{
      
      request.get(
        'https://graph.qq.com/user/get_user_info?access_token='+access_token+'&oauth_consumer_key='+(oauth_consumer_key || this.appid)+'&openid='+openid,
        {},
        function (error: any, response: any, body: any) {
    
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            resolve(info);
          } else {
            reject(error);
          }
        }
      )

    })
  }

}

let qq = new QQClass({
  name: 'qq',
  signInUrl: config.domain+'/oauth/qq',
  appid: config.oauth.qq.appid+'',
  appkey: config.oauth.qq.appkey,
  redirectUri: config.domain+'/oauth/qq-signin',
  scope: 'get_user_info',
  redirectSignInUri: 'https://graph.qq.com/oauth2.0/authorize?response_type=code&state={csrf}&client_id={appid}&redirect_uri={redirectUri}&scope={scope}'
});


// 重定向到第三方验证页面
export const signIn = qq.redirectSignIn()
export const signInCallback = qq.signInCallback()
export const signInAPI = qq.signIn()