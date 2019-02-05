
export interface Config {
	debug: boolean,
	name: string,
	cookieSecret: string,
	jwtSecret: string,
	defaultAvatar: string,
	mongodbURI: string,
	host: string,
	port: number,
	domain: string,
	email: object,
	oauth: {
		weibo: { appid: number, appSecret: string },
		qq: { appid: number, appkey: string },
		github: { appid: string, appkey: string },
		wechatPC: { appid: string, appkey: string },
		wechat: { token: string, appid: string, appkey: string }
		landingPage: string
  },
	qiniu: object,
	jpush: object,
	alicloud: object,
	yunpian: object
}


const config:Config = {
	// 调试
	debug: true,
	// 社区名称
	name: '小度鱼API',
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
	port: 3000,
	// 网站的域名 [必填]
	domain: 'http://localhost:3000',

	// 第三方发送邮件服务
	email: {
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
		wechat: { token: '', appid: '', appkey: '' },
		// 授权成功后跳转到着陆网站，注意是绝对地址
		landingPage: 'https://www.xiaoduyu.com'
	},

	// 上传头像、图片文件到七牛 [必填, 否则将不支持图片上传]
	qiniu: {
		accessKey: '',
    secretKey: '',
    bucket: '',
    // 七牛的资源地址，“//” 需保留
    url: '//img.xiaoduyu.com'
	},

	jpush: {
		// 是否是生产环境
		production: false,
		appKey: '',
		masterSecret: ''
	},

	// 阿里云
	alicloud: {
		// 短信服务
		sms: {
			accessKeyId: '',
			secretAccessKey: '',
			// 短信签名
			signName: '小度鱼',
			// 短信模版CODE
			templateCode: 'SMS_****'
		}
	},

	// 云片
	yunpian: {
		// 国际短信
		international: {
			apikey: '',
			text: '【XiaoDuYu】security code: {code}. Use this to finish verification.'
		}
	}

}

export default config
