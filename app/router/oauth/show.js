
import { domain, oauth } from '../../../config';

// 打开QQ登录接入页面
export default (oauthType) => {
  return (req, res, next) => {

    if (!oauth[oauthType]) {
      return;
    }

    let csrf = Math.round(900000*Math.random()+100000);
    let opts = { httpOnly: true, path: '/', maxAge: 1000 * 60 * 5 };

    // 设置登录成后的着陆页面
    let landingPage = config.oauth.landingPage;
    if (req.headers && req.headers.referer) landingPage = req.headers.referer;

    let domain = [];

    let _arr = landingPage.split('/');

    domain.push(_arr[0]);
    domain.push(_arr[1]);
    domain.push(_arr[2]);

    domain = domain.join('/');

    res.cookie('csrf', csrf, opts);

    res.cookie('access_token', req.query.access_token || '', opts);
    // 着陆网站的域名
    res.cookie('landing_page_domain', domain, opts);
    // 着陆网站页面，登陆成功后跳转到该页面
    res.cookie('landing_page', landingPage, opts);

    // github
    var path = "http://github.com/login/oauth/authorize";
    path += '?client_id=' + appConfig.appid;
    path += '&scope=' + appConfig.scope;
    path += '&state=' + csrf;
    path += '&redirect_uri=' + encodeURIComponent(appConfig.redirectUri);
    //转发到授权服务器
    res.redirect(path);

    // qq
    var path = "https://graph.qq.com/oauth2.0/authorize?response_type=code&state=";
    path += '?client_id=' + appConfig.appid;
    path += '&scope=' + appConfig.scope;
    path += '&state=' + csrf;
    path += '&redirect_uri=' + encodeURIComponent(appConfig.redirectUri);

    res.redirect('https://graph.qq.com/oauth2.0/authorize?response_type=code&state='+csrf+'&client_id='+appConfig.appid+'&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+'&scope='+appConfig.scope);

    // weibo

    res.redirect('https://api.weibo.com/oauth2/authorize?response_type=code&state='+csrf+'&client_id='+appConfig.appid+'&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+'&scope='+appConfig.scope);

    // wechat pc

    var url = 'https://open.weixin.qq.com/connect/qrconnect?'+
    'appid='+appConfig.appid+
    '&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+
    '&response_type=code'+
    '&scope='+appConfig.scope+
    '&state='+csrf+'#wechat_redirect'


    // wechat
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize'+
    '?appid='+appConfig.appid+
    '&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+
    '&response_type=code'+
    '&scope='+appConfig.scope+
    '&state='+csrf+'#wechat_redirect'

  }
} 