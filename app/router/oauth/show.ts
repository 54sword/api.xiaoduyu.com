
import xss from 'xss';

import config from '../../../config';
import { User, Oauth } from '../../models';

import synthesis from '../../utils/synthesis';

interface Data {
  appid: string
  appkey: string
  redirectUri: string
  scope: string
  redirectSignInUri: string
}

/**
 * 将字符串中的变量，替换成具体的值
 * @param  {String}  string 需要替换的字符串
 * @param  {String}  key    变量名
 * @param  {String}  value  变量值
 * @return {String}
 */
// const synthesis = (string: string, key: string, value:string):string => {
//   return string.replace(new RegExp("({"+key+"})","g"), value)
// }

export default class OAuthClass {
  
  readonly appid: string
  readonly appkey: string
  readonly redirectUri: string
  readonly scope: string
  readonly redirectSignInUri: string

  constructor(data:Data) {
    this.appid = data.appid
    this.appkey = data.appkey
    this.redirectUri = data.redirectUri
    this.scope = data.scope
    this.redirectSignInUri = data.redirectSignInUri
  }

  // 重定向登录
  public redirectSignIn() {
    return (req: any, res: any): void => {

      // 跨站请求伪造
      const csrf = Math.round(900000*Math.random()+100000),
            // cookie 设置
            opts = { httpOnly: true, path: '/', maxAge: 1000 * 60 * 5 },
            // 着陆网站页面，登陆成功后跳转到该页面
            landingPage = req.headers.referer || config.oauth.landingPage,
            // domain:Array<string> = [],
            // 储存访问令牌
            accessToken = req.query.access_token || '',
            // 着陆网站的域名，获取的token或传到 xiaoduyu.com/oauth?token=***
            landingPageDomain = landingPage.split('/').slice(0,2).join('/');

      res.cookie('csrf', csrf, opts);
      res.cookie('access_token', accessToken, opts);
      res.cookie('landing_page_domain', landingPageDomain, opts);
      res.cookie('landing_page', landingPage, opts);

      let url = synthesis(this.redirectSignInUri, {
        appid: this.appid,
        scope: this.scope,
        csrf,
        redirectUri: encodeURIComponent(this.redirectUri)
      });
      
      res.redirect(url);
    }
  }

  public SignInCallback() {
    return (req: any, res: any, next: any)=>{
    }
  }

  // 创建用户
  private createUser(user: any): Promise<object> {
    // xss过滤
    user.nickname = xss(user.nickname, {
      whiteList: {},
      stripIgnoreTag: true,
      onTagAttr: () => ''
    });
    return User.save({ data: user });
  }
  
  // 创建oauth
  private createOAuth(user:any, newUser:any): Promise<object> {
    user.user_id = newUser._id;
    user.source = 'github';
    return Oauth.save({ data: user });
  }

}