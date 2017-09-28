
var config = {
	// 调试
	debug: true,
	// 社区名称
	name: '小度鱼API',
	// cookie 配置 [必填，建议修改]
	cookie_secret: 'cookie_secret_xiaoduyu',
	// jwt配置 [必填，建议修改]
	// https://github.com/hokaccha/node-jwt-simple
	jwt_secret: 'jwt_secret_xiaoduyu',
	// 默认用户头像
	defaultAvatar: '//img.xiaoduyu.com/default_avatar.jpg',
	// mongodb配置 [必填]
	db_url: 'mongodb://localhost:27017/xiaoduyu',
	// 本地ip [必填]
	host: 'localhost',
	// 端口 [必填]
	port: 3000,
	// 网站的域名 [必填]
	domain: 'http://localhost:3000',
	// 联系邮箱 [选填]
	contactEmail: '',

	// 第三方发送邮件服务
	email: {
		// SendCloud配置信息，用于发送邮件 [必填, 否则将不能发送邮件]
		// https://sendcloud.sohu.com
		sendCloud: {
			from: '',
		  apiUser: '',
		  apiKey: ''
		},
		// qq邮箱配置信息[未使用]
		qq: {
			host: 'smtp.exmail.qq.com',
	    port: 465,
	    auth: {
	      user: '',
	      pass: ''
	    }
		}
	},

	// 第三方登录 [必填, 否则将不支持QQ、微博登录]
	oauth: {
		// weibo: { appid: 0, appSecret: '' },
		// qq: { appid: '', appkey: '' },
		// github: { appid: '', appkey: '' },
		// wechat: { appid: '', appkey: '' },
		// wechat_pc: { appid: '', appkey: '' },
		// 授权成功后跳转到着陆网站
		landingPage: ''
	},

	// 上传头像、图片文件到七牛 [必填, 否则将不支持图片上传]
	qiniu: {
		accessKey: '',
    secretKey: '',
    bucket: '',
    // 七牛的资源地址
    url: ''
	},

	// https 用于域名的验证的路径（Let's encrypt）
	// https://github.com/xdtianyu/scripts/blob/master/lets-encrypt/README-CN.md
	sslPath: '',

	jpush: {
		// 是否是生产环境
		production: false,
		appKey: '',
		masterSecret: ''
	}

};

module.exports = config;
