
export interface Config {
	debug: boolean
	name: string
	cookieSecret: string
	jwtSecret: string
	defaultAvatar: string
	mongodbURI: string
	host: string
	port: number
	domain: string
	email: {
		sendCloud: {
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
	jpush: {
		// 是否是生产环境
		production: boolean,
		appKey: string,
		masterSecret: string
	}
	alicloud: {
		sms: {
			accessKeyId: string
			secretAccessKey: string
			signName: string
			templateCode: string
		}
	}
	yunpian: {
		international: {
			apikey: string
			text: string
		}
	}
}

let config:Config = {
	// 调试
	debug: false,
	// 社区名称
	name: '鸭爪',
	// cookie 配置 [必填，建议修改]
	// cookieSecret: 'cookie_secret_xiaoduyu',
	cookieSecret: 'yazhua_cookie_secret_Z1lN3',
	// jwt配置 [必填，建议修改]
	// https://github.com/hokaccha/node-jwt-simple
	// jwtSecret: 'jwt_secret_xiaoduyu',
	jwtSecret: 'yazhua_jwt_secret_Z1lN3',
	// 默认用户头像
	defaultAvatar: '//api.yazhua.com/default_avatar.jpg',
	// mongodb配置 [必填]
	// mongodbURI: 'mongodb://localhost:27017/xiaoduyu',
	mongodbURI: 'mongodb://yazhua_db:yazhua.abcd.1234@localhost:27017/yazhua',
	
	host: 'localhost',
	// 端口 [必填]
	port: 3000,
	// 网站的域名 [必填]
	domain: 'https://api.yazhua.com',
	
	// 第三方发送邮件服务
	email: {
		// SendCloud配置信息，用于发送邮件 [必填, 否则将不能发送邮件]
		// https://sendcloud.sohu.com
		sendCloud: {
			from: 'hi@yazhua.com',
		  apiUser: 'yazhua.com',
		  apiKey: 'JbZRrppkgLTG5vtt'
		}

		// API_KEY JbZRrppkgLTG5vtt

		// qq邮箱配置信息[选填]
		// qq: {
		// 	host: 'smtp.exmail.qq.com',
	  //   port: 465,
	  //   auth: {
	  //     user: 'no-reply@jtjsf.com',
	  //     pass: 'wu_shijian_1987'
	  //   }
		// }
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
		landingPage: 'https://www.yazhua.com'
	},

	// 上传头像、图片文件到七牛 [必填, 否则将不支持图片上传]
	qiniu: {
		accessKey: 'V7Tt-TvFyxpd0r6w0iyg6L4PkZOv0oRUsB1xymfm',
    secretKey: 'CIK0hDp3gPBBxaEA_gHyWiqVgmDldoG4a_yDg4iE',
    bucket: 'xiaoduyu',
    // 七牛的资源地址
    url: '//img.xiaoduyu.com'
	},

	jpush: {
		// 是否是生产环境
		production: true,
		appKey: '521b4e4d1cc1447ec6c452b7',
		masterSecret: '521b4e4d1cc1447ec6c452b7'
	},
	
	// 阿里云
	alicloud: {
		// 短信服务
		sms: {
			accessKeyId: 'LTAIQEl28ypqyA75',
			secretAccessKey: 'J5VySvnF7UVYQ1nau0mmAnhJOujgAt',
			// 短信签名
			signName: '鸭爪网',
			// 短信模版CODE
			templateCode: 'SMS_101115092'
		}
	},

	// 云片
	yunpian: {
		// 国际短信
		international: {
			apikey: '59eeb8d8b0cba8d8cf3a0a5d5b0e3678',
			text: '【YaZhuaWang】security code: {code}. Use this to finish verification.'
		}
	}

}

if (process.env.NODE_ENV == 'development') {
	config.debug = true;
	config.port = 3000;
	config.mongodbURI = 'mongodb://localhost:27017/yazhua';
	config.domain = 'http://localhost:3000';
	config.jpush.production = false;
}

export default config;
