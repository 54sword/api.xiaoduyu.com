

var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
// var jwt = require('jwt-simple');

var config = require('./config');

var API_V1 = require('./app/api-v1');
var graphql = require('./app/graphql');


import OauthRouter from './app/oauth'
import outputError from './config/error'


var app = express();
var server = http.createServer(app);

// var graphqlHTTP = require('express-graphql');

require('./app/common/log4js')(app);


// 抵御一些比较常见的安全web安全隐患
// https://cnodejs.org/topic/56f3b0e8dd3dade17726fe85
var helmet = require('helmet');
app.use(helmet());

// var csrfProtection = csrf({ cookie: true });
// var parseForm = bodyParser.urlencoded({ extended: false });

app.set('jwtTokenSecret', config.jwt_secret);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
// http://www.cnblogs.com/vipstone/p/4865079.html
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie_secret));
app.set('trust proxy', 1);
app.use(compress()); // gzip

app.use(express.static(path.join(__dirname, 'public')));

// Let's encrypt 用于域名的验证
// https://github.com/xdtianyu/scripts/blob/master/lets-encrypt/README-CN.md
// if (config.sslPath) {
	// app.use(express.static(path.join(__dirname, config.sslPath)));
// }

app.all('*',function (req, res, next) {

	req.jwtTokenSecret = app.get('jwtTokenSecret');

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

const handlePreflightRequest = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-fc-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.end();
};

var onlineUserCount = 0;
/*
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
	server: server,
	path: 'socket'
});

wss.on('connection', function(ws) {
	console.log(ws);
});
*/

// var allowedOrigins = "*:*";
var io = require("socket.io").listen(server);
// io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
// io.origins(['*','*:*']);
// io.set('origins', 'www.acgnz.com:* http://127.0.0.1:4000');
io.on('connection', function(socket){

	// console.log(socket.server);

	// console.log(socket.handshake.query);

	onlineUserCount += 1
	io.sockets.emit("online-user-count", onlineUserCount);

  socket.on('disconnect', function(){
		// console.log('-------断开--');
		onlineUserCount -= 1
		io.sockets.emit("online-user-count", onlineUserCount);
	});

	// socket.on('heartbeat', function(){
		// console.log('心跳...');
		// onlineUserCount -= 1
		// io.sockets.emit("online-user-count", onlineUserCount);
	// });

});
global.io = io

graphql(app, bodyParser);

app.use('/oauth', OauthRouter());
app.use('/api/v1', API_V1());

/*
app.use(function (req, res, next) {
  // 计算页面加载完成花费的时间
  // var exec_start_at = Date.now();
  var _send = res.send;
  res.send = function () {

		// 如果返回结果中，包含错误代码，则装换成普通语言提示
		// if (arguments[0] && typeof arguments[0].success != 'undefined' && !arguments[0].success && arguments[0].error) {
		// 	// arguments[0].error = '错误提醒测试'
		// 	console.log(arguments[0]);
		// 	arguments[0] = outputError(arguments[0])
		// }

    // 发送Header
    // res.set('X-Execution-Time', String(Date.now() - exec_start_at) + ' ms');
    // 调用原始处理函数
    return _send.apply(res, arguments);
  };
  next();
});
*/

// app.use('/', function(req, res){
// 	res.send('运行中');
// });

app.use(function(req, res, next) {
	res.status(404);
	res.send('404 NOT FOUND');
});

server.listen(config.port);
