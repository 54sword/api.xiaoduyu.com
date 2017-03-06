var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var compress = require('compression');

// mongodb
// var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);

var config = require('./config');

var API_V1 = require('./app/api-v1');
var OauthRouter = require('./app/oauth');

// var auth = require('./app/middlewares/auth');
// var site = require('./app/middlewares/site');

// var newAuth = require('./app/api/v1/middlewares/auth');

var jwt = require('jwt-simple');
var app = express();

//----------
// 服务器日志
// 正式环境下开启
if (!config.debug) {

	var log4js = require('log4js');
	var appenders = [];

	appenders.push({ type: "console" });
	appenders.push({
		type: "dateFile",
		filename: "logs/access.log",
		pattern: "_yyyy-MM-dd",
		alwaysIncludePattern: false,
		category: "normal"
	});

	log4js.configure({
		appenders: appenders,
		replaceConsole: true,
		levels: {
			dateFileLog: "INFO"
		}
	});

	var _logger = log4js.getLogger('normal');

	app.use(log4js.connectLogger(_logger, {level:log4js.levels.INFO}));
}

//----------


// 抵御一些比较常见的安全web安全隐患
// https://cnodejs.org/topic/56f3b0e8dd3dade17726fe85
var helmet = require('helmet');
app.use(helmet());

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

app.set('jwtTokenSecret', config.jwt_secret);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie_secret));
app.set('trust proxy', 1);
app.use(compress()); // gzip
/*
app.use(session({
	secret: config.session_secret,
	cookie: { maxAge: 1000 * 60 * 20 },  // session 10分钟有效时间
	store: new MongoStore({
		url: config.db_url
		// touchAfter: 24 * 3600 // time period in seconds
	}),
  resave: true,
  saveUninitialized: true
}));
*/
app.use(express.static(path.join(__dirname, 'public')));

// Let's encrypt 用于域名的验证
// https://github.com/xdtianyu/scripts/blob/master/lets-encrypt/README-CN.md
if (config.sslPath) {
	app.use(express.static(path.join(__dirname, config.sslPath)));
}

/*
// 强制去除www
app.get('/*', function(req, res, next) {
  if (req.headers.host && req.headers.host.match(/^www/) !== null ) {
    res.redirect('http://www.' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();
  }
});
*/


app.all('*',function (req, res, next) {

	req.jwtTokenSecret = app.get('jwtTokenSecret')

	// console.log(app.get('jwtTokenSecret'))

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With ,yourHeaderFeild, AccessToken');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

	// console.log(req.headers)

  if (req.method == 'OPTIONS') {
		// 跨域并设置headers的请求，所有请求需要两步完成！
		// 第一步：发送预请求 OPTIONS 请求。此时 服务器端需要对于OPTIONS请求作出响应 一般使用202响应即可 不用返回任何内容信息。
		// res.status(200);
		res.sendStatus(204);
  } else {
    next();
  }

});

// app.use(newAuth.authUser);
// app.use(csrfProtection, site.initData);

app.use('/oauth', OauthRouter());
app.use('/api/v1', API_V1());
app.use('/', function(req, res){
	res.send('运行中');
});

// 初始化页面的基础数据

// app.use('/', webRequire(csrfProtection));

// csrf被拒绝访问后
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // handle CSRF token errors here
  res.status(403);
  res.send('form tampered with');
});

if (config.debug) {

	// 不压缩 html 代码
	app.locals.pretty = true;

	app.use(function(req, res, next) {

		res.status(404);
		res.send('404 NOT FOUND');

		/*
		var err = new Error('Not Found');
	  err.status = 404;
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: {}
    });
		*/
  });


	/*
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
	  err.status = 404;
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: err
    });
  });
	*/

} else {

	app.use(function(req, res, next) {

		res.status(404);
		res.send('404 NOT FOUND');

		/*
		var err = new Error('Not Found');
	  err.status = 404;
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: {}
    });
		*/
  });

	/*
	app.use(function(req, res, next) {
		res.status(404);
		res.send('404 NOT FOUND');
	});
	*/
}

/*
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;
