"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xss_1 = __importDefault(require("xss"));
const config_1 = __importDefault(require("../../../config"));
const models_1 = require("../../models");
const synthesis_1 = __importDefault(require("../../utils/synthesis"));
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
class OAuthClass {
    constructor(data) {
        this.appid = data.appid;
        this.appkey = data.appkey;
        this.redirectUri = data.redirectUri;
        this.scope = data.scope;
        this.redirectSignInUri = data.redirectSignInUri;
    }
    // 重定向登录
    redirectSignIn() {
        return (req, res) => {
            // 跨站请求伪造
            const csrf = Math.round(900000 * Math.random() + 100000), 
            // cookie 设置
            opts = { httpOnly: true, path: '/', maxAge: 1000 * 60 * 5 }, 
            // 着陆网站页面，登陆成功后跳转到该页面
            landingPage = req.headers.referer || config_1.default.oauth.landingPage, 
            // domain:Array<string> = [],
            // 储存访问令牌
            accessToken = req.query.access_token || '', 
            // 着陆网站的域名，获取的token或传到 xiaoduyu.com/oauth?token=***
            landingPageDomain = landingPage.split('/').slice(0, 2).join('/');
            res.cookie('csrf', csrf, opts);
            res.cookie('access_token', accessToken, opts);
            res.cookie('landing_page_domain', landingPageDomain, opts);
            res.cookie('landing_page', landingPage, opts);
            let url = synthesis_1.default(this.redirectSignInUri, {
                appid: this.appid,
                scope: this.scope,
                csrf,
                redirectUri: encodeURIComponent(this.redirectUri)
            });
            res.redirect(url);
        };
    }
    SignInCallback() {
        return (req, res, next) => {
        };
    }
    // 创建用户
    createUser(user) {
        // xss过滤
        user.nickname = xss_1.default(user.nickname, {
            whiteList: {},
            stripIgnoreTag: true,
            onTagAttr: () => ''
        });
        return models_1.User.save({ data: user });
    }
    // 创建oauth
    createOAuth(user, newUser) {
        user.user_id = newUser._id;
        user.source = 'github';
        return models_1.Oauth.save({ data: user });
    }
}
exports.default = OAuthClass;
