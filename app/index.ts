
// import '@babel/register';
// import '@babel/polyfill';

import express from 'express';
import http from 'http';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

// 启动 gzip 压缩
// import compress from 'compression';

// 日志记录
import log4js from './utils/log4js';

// 抵御一些比较常见的安全web安全隐患
// https://cnodejs.org/topic/56f3b0e8dd3dade17726fe85
import helmet from 'helmet';


// 安全机制限制客户端api请求频率
import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';

// import CreateError from './app/graphql/common/errors';



import config from '../config';

import graphql from './graphql';
import router from './router';
import socket from './socket';

var app = express();
var server = http.createServer(app);


// 限制每个ip，一小时最多1500次请求
const limiter = rateLimit({
  store: new MongoStore({
		uri: config.db_url,
		expireTimeMs: 60 * 60 * 1000
  }),
  windowMs: 60 * 60 * 1000,
	max: 1500
});


// 启动日志
log4js(app);
app.use(helmet());
if (config.debug) app.use(logger('dev'));
// http://www.cnblogs.com/vipstone/p/4865079.html
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser(config.cookie_secret));
// 可以支持X-Forwarded-Proto(协议代理) X-Forwarded-For(ip代理), X-Forwarded-Host(主机代理)
app.set('trust proxy', 1);
// app.use(compress()); 

app.use(express.static(path.join(__dirname, 'public')));

app.use(limiter);

app.all('*',function (req, res, next) {

	// req.jwtTokenSecret = app.get('jwtTokenSecret');

  res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, AccessToken, Role, X-Requested-With');
	// res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With ,yourHeaderFeild, AccessToken');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
		// 跨域并设置headers的请求，所有请求需要两步完成！
		// 第一步：发送预请求 OPTIONS 请求。此时 服务器端需要对于OPTIONS请求作出响应 一般使用202响应即可 不用返回任何内容信息。
		// res.status(200);
		res.sendStatus(204);
  } else {
    next();
  }

});


if (config.oauth.wechatToken) {

	app.all('*', (req, res, next)=>{
		if (req.method === 'GET') {

			const { signature, timestamp, nonce, echostr } = req.query
			// 微信验证
			if (signature && timestamp && nonce) {
				let sha1 = crypto.createHash('sha1'),
		        sha1Str = sha1.update([config.oauth.wechatToken, timestamp, nonce].sort().join('')).digest('hex');
		        res.send((sha1Str === signature) ? echostr : '');
						return
			} else {
				next()
			}
	  } else {
			next()
		}
	});

}

socket(server);

// 设置路由
app.use('/', router());

graphql(app);

app.use(function(req, res, next) {
	res.status(404);
	res.send('404 not found');
});

server.listen(config.port);

console.log('server started on port ' + config.port);