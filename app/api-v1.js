
var express = require('express');

var user = require('./api/v1/user');
var account = require('./api/v1/account');
var commment = require('./api/v1/comment');
var like = require('./api/v1/like');
var UserNotification = require('./api/v1/user-notification');
var Captcha = require('./api/v1/captcha');
var QiNiu = require('./api/v1/qiniu');
var Posts = require('./api/v1/posts');
var Topic = require('./api/v1/topic');
var Follow = require('./api/v1/follow');
var Phone = require('./api/v1/phone');
import Countries from './api/v1/countries'
import Report from './api/v1/report'
import Block from './api/v1/block'

var token = require('./api/v1/token')

var qq = require('./oauth/qq');
var weibo = require('./oauth/weibo');
var github = require('./oauth/github');

var auth = require('./api/v1/middlewares/auth');

/*
import { renderToString } from 'react-dom/server'

var Redis = require('ioredis');
var redis = new Redis();

// redis.set('foo', 'bar1111');
redis.get('foo', function (err, result) {
  console.log(result);
});
*/

/*
import redraft from 'redraft'

const renderers = {
  inline: {
    // The key passed here is just an index based on rendering order inside a block
    BOLD: (children, { key }) => `<strong key=${key}>${children}</strong>`,
    ITALIC: (children, { key }) => `<em key=${key}>${children}</em>`,
    UNDERLINE: (children, { key }) => `<u key=${key}>${children}</u>`,
    CODE: (children, { key }) => `<span key=${key}>${children}</span>`
  },
  blocks: {
    unstyled: (children) => children.map(child => `<p>${child}</p>`),
    blockquote: (children, key) => {
      // console.log(key)
      return `<blockquote key=${key.keys[0]}>${addBreaklines(children)}</blockquote>`
    },
    'header-one': (children) => children.map(child => `<h1>${child}</h1>`),
    'header-two': (children) => children.map(child => `<h2>${child}</h2>`),
    // You can also access the original keys of the blocks
    'code-block': (children, { keys }) => `<pre key=${keys[0]} >${addBreaklines(children)}</pre>`,
    // or depth for nested lists
    'unordered-list-item': (children, { depth, keys }) => `<ul key=${keys[keys.length - 1]}>${children.map((child, index) => `<li key=${keys[index]}>${child}</li>`)}</ul>`,
    'ordered-list-item': (children, { depth, keys }) => `<ol key=${keys.join('|')}>${children.map((child, index)=> `<li key=${keys[index]}>${child}</li>`)}</ol>`,
    // If your blocks use meta data it can also be accessed like keys
    atomic: (children, data) => {
      return children[0]
      // children.map((child, i) => {
        // console.log(children, data)
    }
  },
  entities: {
    youku: (children, data, { key }) => `<div key=${key} data-youku=${data.src}></div>`,
    tudou: (children, data, { key }) => `<div key=${key} data-tudou=${data.src}></div>`,
    qq: (children, data, { key }) => `<div key=${key} data-qq=${data.src}></div>`,
    youtube: (children, data, { key }) => `<div key=${key} data-youtube=${data.src}></div>`,
    image: (children, data, { key }) => `<img key=${key} src=${data.src} />`,
    '163-music-song': (children, data, { key }) => `<div key=${key} data-163musicsong=${data.src}></div>`,
    '163-music-playlist': (children, data, { key }) => `<div key=${key} data-163musicplaylist=${data.src}></div>`,
    LINK: (children, data, { key }) => `<a key=${key} href=${data.url} target="_blank" rel="nofollow">${children}</a>`
  }
}


let json ={"entityMap":{"0":{"type":"image","mutability":"IMMUTABLE","data":{"src":"//img.xiaoduyu.com/ED7AC36B-A150-4C38-BB8C-B6D696F4F2ED?imageMogr2/auto-orient/thumbnail/!600/quality/85"}}},"blocks":[{"key":"eh1ip","text":"123","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9sl5i","text":"3333","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"enjis","text":"444","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2vl8a","text":"5555","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2drjn","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":0}],"data":{}},{"key":"apv2r","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}
let html = redraft(json, renderers)

console.log(renderToString(`<div>${html}</div>`));
*/


var APIRequire = function() {

  var router = express.Router();

  router.post('/user', auth.userRequired, user.fetch);

  router.get('/people/:id', auth.openType, user.fetchById);

  router.get('/countries', Countries.fetch);

  router.post('/get-captcha', auth.openType, Captcha.add);
  router.get('/captcha-image/:id', Captcha.showImage);
  router.get('/get-captcha-id', Captcha.getCaptchaId);

  router.post('/signin', account.signin);
  router.post('/signup', account.signup);
  router.post('/signup-email-verify', account.signupEmailVerify);

  router.post('/send-email-verify-captcha', auth.userRequired, account.sendEmailVerifyCaptcha);
  router.post('/check-email-verify-captcha', auth.userRequired, account.checkEmailVerifyCaptcha);
  router.post('/check-email-and-send-verify-captcha', auth.userRequired, account.checkEmailAndSendVerifyCaptcha);
  router.post('/reset-email', auth.userRequired, account.resetEmail);
  router.post('/send-captcha-to-mailbox', account.sendEmailCaptcha);
  router.post('/reset-password-by-captcha', user.resetPasswordByCaptcha);
  router.post('/binding-email', auth.userRequired, account.bindingEmail);

  router.post('/reset-password', auth.userRequired, user.resetPassword);
  router.post('/reset-nickname', auth.userRequired, user.resetNickname);
  router.post('/reset-gender', auth.userRequired, user.resetGender);
  router.post('/reset-brief', auth.userRequired, user.resetBrief);
  router.post('/reset-avatar', auth.userRequired, user.resetAvatar);
  router.post('/reset-phone', auth.userRequired, Phone.reset);
  router.post('/binding-phone', auth.userRequired, Phone.binding);

  router.post('/add-posts', auth.userRequired, Posts.add);
  router.post('/update-posts', auth.userRequired, Posts.update);
  router.get('/posts', auth.openType, Posts.fetch);
  router.get('/view-posts', Posts.view);


  router.post('/write-comment', auth.userRequired, commment.add);
  router.post('/update-comment', auth.userRequired, commment.update);
  router.get('/comments', auth.openType, commment.fetch);

  router.get('/topic', auth.openType, Topic.fetch);
  router.post('/add-topic', auth.adminRequired, Topic.add);
  router.post('/update-topic', auth.adminRequired, Topic.update);

  router.post('/like', auth.userRequired, like.add);
  router.post('/unlike', auth.userRequired, like.unlike);

  router.get('/follow', auth.openType, Follow.fetch);
  router.post('/add-follow', auth.userRequired, Follow.add);
  router.post('/remove-follow', auth.userRequired, Follow.remove);

  router.post('/notifications', auth.userRequired, UserNotification.fetch);
  router.get('/unread-notifications', auth.userRequired, UserNotification.fetchUnreadCount);

  router.post('/get-qiniu-token', auth.userRequired, QiNiu.getToken);

  // 解除绑定
  router.post('/unbinding-qq', auth.userRequired, qq.unbinding);
  router.post('/unbinding-weibo', auth.userRequired, weibo.unbinding);
  router.post('/unbinding-github', auth.userRequired, github.unbinding);

  router.post('/weibo-get-user-info', auth.openType, weibo.getUserInfo);
  router.post('/qq-get-user-info', auth.openType, qq.getUserInfo);

  // 旧token兑换新的token
  router.post('/exchange-new-token', token.exchange);
  // router.post('/check-token', token.check);

  router.post('/add-report', auth.userRequired, Report.add)
  router.get('/get-report-list', Report.getList)

  // 拉黑/屏蔽
  router.get('/block', auth.userRequired, Block.fetch)
  router.post('/add-block', auth.userRequired, Block.add)
  router.post('/remove-block', auth.userRequired, Block.remove)

  return router;
};

module.exports = APIRequire;
