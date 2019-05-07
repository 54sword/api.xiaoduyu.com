import xss from 'xss'

import config from '../../../config'
import { User, Oauth, Token } from '../../models'
import synthesis from '../../utils/synthesis'
import To from '../../utils/to'
import social from '../../../config/social'

import { getIP } from '../../utils/tools';

import checkToken from '../../graphql/common/check-token'

import { downloadImgAndUploadToQiniu } from '../../graphql/models/qiniu/resolvers';

interface Data {
  name: string
  signInUrl: string
  appid: string
  appkey: string
  redirectUri: string
  scope: string
  redirectSignInUri: string
}

interface SocialInfo {
  nickname: string
  avatar?: string
  gender?: number
  source?: number
}

interface SocialAccessToken {
  openid: string
  access_token: string
  expires_in?: number
  refresh_token?: string
}

interface Handle {
  userId?: string
  source: string
  socialAccessToken: SocialAccessToken
  socialInfo: SocialInfo
}

export default class OAuthClass {

  // 第三方登录的名称
  readonly name: string
  // 登录的url绝对地址
  readonly signInUrl: string
  readonly appid: string
  readonly appkey: string
  // 登录回掉地址
  readonly redirectUri: string
  readonly scope: string
  // 登录重定向地址
  readonly redirectSignInUri: string

  constructor(data:Data) {
    this.name = data.name
    this.signInUrl = data.signInUrl
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
            opts = { httpOnly: true, path: '/', maxAge: 1000 * 60 * 15 },
            // 着陆网站页面，登陆成功后跳转到该页面
            landingPage = req.headers.referer || config.oauth.landingPage,
            // domain:Array<string> = [],
            // 储存访问令牌
            accessToken = req.query.access_token || '',
            // 着陆网站的域名，获取的token或传到 xiaoduyu.com/oauth?token=***
            landingPageDomain = landingPage.split('/').slice(0,3).join('/');

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

  public checkAccessToken (user_access_token: string): Promise<any> {

    return new Promise(async resolve=>{

      let result = await checkToken({ token:user_access_token, role:'' });

      if (result && result.user) {
        resolve(result.user)
      } else {
        resolve()
      }

      // var decoded = JWT.decode(user_access_token), user;

      // if (decoded && decoded.expires > new Date().getTime()) {
      //   let [ err, _user ] = await To(User.findOne({ query: { _id: decoded.user_id } }));
      //   if (err) console.log(err);
      //   if (_user && _user[0]) user = _user[0]
      // }

      // resolve(user)

    })

  }

  /**
   * 
   * @param param0 
   */
  public handle({ userId, socialAccessToken, socialInfo, source }: Handle) {

    return new Promise(async (resolve, reject)=>{

      let err, oauth;
      
      // 通过 openid 获取 oauth
      [ err, oauth ] = await To(Oauth.fetchByOpenIdAndSource(socialAccessToken.openid, source));

      if (err) console.log(err);
      
      // 绑定失败，账号已绑定
      if (userId && oauth && oauth.deleted == false) {
        reject('has_been_binding');
        return;
      }

      // 将已解除绑定的账号，重新绑定用户
      if (userId && oauth && oauth.deleted == true) {

        let [ err ] = await To(Oauth.update({
          query: { _id: oauth._id },
          update: {
            access_token: socialAccessToken.access_token,
            expires_in: socialAccessToken.expires_in || 0,
            refresh_token: socialAccessToken.refresh_token || '',
            user_id: userId,
            deleted: false
          }
        }));

        if (err) {
          reject('binding_failed');
          return
        } else {
          reject('binding_finished');
          return
        }

      }

      // 已注册用户绑定微信
      if (userId && !oauth) {

        await To(Oauth.save({
          data: {
            ...socialAccessToken,
            user_id: userId,
            source: social[source]
          }
        }));

        reject('binding_finished');
        return;
      }

      // 登陆
      if (!userId && oauth && oauth.deleted == false) {
        return resolve(oauth.user_id);
      }

      // 创新新的用户
      if (!userId && !oauth) {

        // 如果有头像，那么上传头像
        if (socialInfo.avatar) {
          let [ err, avatar ] = await To(downloadImgAndUploadToQiniu(socialInfo.avatar))
          if (avatar) socialInfo.avatar = avatar;
        };

        let [ err, user ] = await To(this.createUser({
          ...socialInfo,
          createDate: new Date()
        }));

        if (err || !user) {
          reject('create_user_failed');
          return;
        }

        [ err ] = await To(Oauth.save({
          data: {
            ...socialAccessToken,
            user_id: user._id,
            source: social[source]
          }
        }));

        if (err) {
          // console.log(err);
          reject('create_oauth_failed');
          return;
        }

        resolve(user._id);

        return

      }

      
      // oauth 是删除状态，绑定新账户，并恢复成可用状态
      if (!userId && oauth && oauth.deleted == true) {

        // 如果有头像，那么上传头像
        if (socialInfo.avatar) {
          let [ err, avatar ] = await To(downloadImgAndUploadToQiniu(socialInfo.avatar))
          if (avatar) socialInfo.avatar = avatar;
        };

        let [ err, user ] = await To(this.createUser({
          ...socialInfo,
          createDate: new Date()
        }));

        if (err || !user) {
          return reject('create_oauth_failed');
        }

        await To(Oauth.update({
          query: { _id: oauth._id },
          update: {
            user_id: user._id,
            deleted: false
          }
        }));

        resolve(user._id);

      }

    })
  }
  

  public goToNoticePage(req: any, res: any, string: string) {
    var landingPageDomain = req.cookies['landing_page_domain']
    res.redirect(landingPageDomain+'/notice?notice='+string)
  }

  // 创建token
  public createAccessToken(ip: string, userId: string): Promise<object> {
    return Token.create({ userId, ip });
  }

  public async goToAutoSignin(req: any, res: any, userId: string) {
    let ip = getIP(req);
    var result: any = await this.createAccessToken(ip, userId)
    var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
    var landingPageDomain = req.cookies['landing_page_domain'] || config.oauth.landingPage;
    res.redirect(landingPageDomain+'/oauth?access_token='+result.access_token+'&expires='+result.expires+'&landing_page='+landingPage)
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
  // private createOAuth(user:any, newUser:any): Promise<object> {
  //   user.user_id = newUser._id;
  //   user.source = 'github';
  //   return Oauth.save({ data: user });
  // }

}