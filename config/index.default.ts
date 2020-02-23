
export interface Config {
	debug: boolean
	mongodbDebug: boolean
	cache: {
		default: number
		graphql: number
	}
	name: string
	officialWebsite: string
	cookieSecret: string
	jwtSecret: string
	defaultAvatar: string
	mongodbURI: string
	host: string
	port: number
	domain: string
	email: {
		feedback: string
		sendCloud?: {
			from: string
		  apiUser: string
		  apiKey: string
		},
		qq?: {
			host: string
	    port: number
	    auth: {
	      user: string
	      pass: string
	    }
		}
	}
	oauth: {
		weibo: { appid: number, appSecret: string }
		qq: { appid: number, appkey: string }
		github: { appid: string, appkey: string }
		wechatPC: { appid: string, appkey: string }
		wechat: { token: string, appid: string, appkey: string }
		landingPage: string
  }
	qiniu: {
		accessKey: string
    secretKey: string
    bucket: string
    url: string
	}
	alicloud: {
		accessKeyId: string
		secretAccessKey: string
		sms: {
			signName: string
			templateCode: string
		}
		push: {
			androidAppKey: string
			iOSAppKey: string
		}
	}
	yunpian: {
		international: {
			apikey: string
			text: string
		}
	}
	baidu?: {
		appKey: string
		appSecret: string
	}
	IPWhitelist: Array<string>
}

let config:Config = {
	// 调试
	debug: false,
	// mongodb debug模式，如果打开会显示数据库的记录
	mongodbDebug: false,

	cache: {
		// 用户信息缓存，解析accessToken成功后获取用户信息并缓存
		default: 180,
		graphql: 60
	},

	// 社区名称
	name: '小度鱼',
	// 官网网站
	officialWebsite: 'https://www.xiaoduyu.com',
	// cookie 配置 [必填，建议修改]
	cookieSecret: 'cookie_secret_xiaoduyu',
	// jwt配置 [必填，建议修改]
	// https://github.com/hokaccha/node-jwt-simple
	jwtSecret: 'jwt_secret_xiaoduyu',
	// 默认用户头像
	defaultAvatar: '//img.xiaoduyu.com/default_avatar.jpg',
	// mongodb配置 [必填]
	mongodbURI: 'mongodb://localhost:27017/xiaoduyu',
	
	host: 'localhost',
	// 端口 [必填]
	port: 9002,
	// 网站的域名 [必填]
	domain: 'https://api.xiaoduyu.com',
	
	// 第三方发送邮件服务
	email: {
		// get the user feedback by email
		feedback: 'feedback@xxx.com',

		// SendCloud配置信息，用于发送邮件 [必填, 否则将不能发送邮件]
		// https://sendcloud.sohu.com
		sendCloud: {
			from: '',
		  apiUser: '',
		  apiKey: ''
		}
	},

	// 第三方登录 [必填, 否则将不支持QQ、微博登录]
	oauth: {
		weibo: { appid: 0, appSecret: '' },
		qq: { appid: 0, appkey: '' },
		github: { appid: '', appkey: '' },
		wechatPC: { appid: '', appkey: '' },
		wechat: {
			// https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
			// 用于验证消息的确来自微信服务器
			token: '',
			appid: '',
			appkey: ''
		},
		// 授权成功后跳转到着陆默认网站，如果能获取到header中的referer，则会以referer中的网站为着陆域名
		landingPage: 'https://www.xiaoduyu.com'
	},

	// 上传头像、图片文件到七牛 [必填, 否则将不支持图片上传]
	qiniu: {
		accessKey: '',
    secretKey: '',
    bucket: '',
    // 七牛的资源地址
    url: '//img.xiaoduyu.com'
	},
	
	// 阿里云
	alicloud: {
		accessKeyId: '',
		secretAccessKey: '',
		// 短信服务
		sms: {
			// 短信签名
			signName: '小度鱼',
			// 短信模版CODE
			templateCode: ''
		},
		push: {
			androidAppKey: '',
			iOSAppKey: ''
		}
	},

	// 云片
	yunpian: {
		// 国际短信
		international: {
			apikey: '',
			text: '【XiaoDuYu】security code: {code}. Use this to finish verification.'
		}
	},

	// 百度，文本审核
	baidu: {
		appKey: '',
		appSecret: ''
	},

	// ip白名单，用于跳过每小时1500次请求的限制
	IPWhitelist: ['::1','::ffff:127.0.0.1','::ffff:192.168.1.4']

}

if (process.env.NODE_ENV == 'development') {
	config.debug = true;
	// config.mongodbDebug = true;
	config.port = 3000;
	config.mongodbURI = 'mongodb://localhost:27017/xiaoduyu';
	config.domain = 'http://localhost:3000';
	config.alicloud.accessKeyId = '';
	config.alicloud.secretAccessKey = '';
}

export default config;
