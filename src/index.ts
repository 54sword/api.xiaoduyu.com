import express from 'express'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// 用于微信验证
import crypto from 'crypto'

// 抵御一些比较常见的安全web安全隐患
// https://cnodejs.org/topic/56f3b0e8dd3dade17726fe85
// https://github.com/helmetjs/helmet
import helmet from 'helmet'

// 安全机制限制客户端api请求频率
import rateLimit from 'express-rate-limit'
import MongoStore from 'rate-limit-mongo'

// 日志记录
import log4js from './utils/log4js'

import config from '../config'

import graphql from './graphql'
import router from './router'
import socket from './socket'

import * as Models from './models';

const app = express();

// 启动日志
log4js(app);

app.use(helmet());

// 开发环境生产,在控制台打印出请求记录
// if (config.debug) app.use(logger('dev'));

// http://www.cnblogs.com/vipstone/p/4865079.html
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

app.use(cookieParser(config.cookieSecret));
// 可以支持X-Forwarded-Proto(协议代理) X-Forwarded-For(ip代理), X-Forwarded-Host(主机代理)
app.set('trust proxy', 1);

if (!config.debug) {
	// [所有请求]限制每个ip，一小时最多1500次请求
	app.use(rateLimit({
		store: new MongoStore({
			uri: config.mongodbURI,
			expireTimeMs: 60 * 60 * 1000
		}),
		windowMs: 60 * 60 * 1000,
		max: 1500,
		skip: (req: any, res: any) => {

      // 获取客户端请求ip
      let ip;
      
      if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].toString().split(",")[0];
      } else {
        ip = req.connection.remoteAddress;
			}
			
			return config.IPWhitelist.indexOf(ip) != -1 ? true : false;
		}
	}));
}

// 设置静态文件，存放一些对外的静态文件
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../assets')));


app.use(function (req: any, res: any, next: any) {

  // 计算页面生成总的花费时间
  const start_at = Date.now();
  const _send = res.send;
  res.send = function () {
    
    // 发送Header
    res.set('X-Execution-Time', String(Date.now() - start_at) + ' ms');

    // 调用原始处理函数
    return _send.apply(res, arguments);
  };

  next();
  
});

app.all('*',function (req, res, next) {

  res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, AccessToken, Role, Cache-Control, X-Requested-With');
	// res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With ,yourHeaderFeild, AccessToken');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
		// 跨域并设置headers的请求，所有请求需要两步完成！
		// 第一步：发送预请求 OPTIONS 请求。此时 服务器端需要对于OPTIONS请求作出响应 一般使用202响应即可 不用返回任何内容信息。
		// res.status(200);
		res.sendStatus(204);

	} else if (req.method === 'GET') {

		if (!config.oauth.wechat.token) {
			next()
			return
		}
		
		// 微信验证
		// https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
		// https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign

		const { signature, timestamp, nonce, echostr } = req.query
		
		if (signature && timestamp && nonce) {
			let sha1 = crypto.createHash('sha1'),
					sha1Str = sha1.update([config.oauth.wechat.token, timestamp, nonce].sort().join('')).digest('hex');
					res.send((sha1Str === signature) ? echostr : '');
					return
		} else {
			next()
		}

  } else {
    next();
  }

});

// 设置路由
app.use('/', router());

graphql(app);

app.use(function(req, res, next) {
	res.status(404);
	res.send('404 not found');
});



// 启动 websocket

const server = app.listen(config.port, ()=>{
	console.log('server started on port ' + config.port);
});

socket(server, Models);

/*
let timer = function() {
	setTimeout(()=>{
		console.log(process.memoryUsage().heapUsed/1024/1204);
		timer();
	}, 5000);
}
timer();
*/