
var config = {
	// 调试
	debug: true,
	// 社区名称
	name: '小度鱼',

	// 必须填写
	cookie_secret: '',
	jwt_secret: '',
	
	// mongodb 配置
	db_url: 'mongodb://192.168.1.111:27017/xiaoduyu',
	// 域名
	host: '192.168.1.111',
	// 端口
	port: 3000,
	// 网站的域名
	domain: 'http://192.168.1.111:3000',
	// 联系邮箱
	contactEmail: '54sword@gmail.com',

	email: {
		//  SendCloud配置信息，用于发送邮件
		// https://sendcloud.sohu.com
		sendCloud: {
			from: '',
		  apiUser: '',
		  apiKey: ''
		},
		//  qq邮箱配置信息
		qq: {
			host: 'smtp.exmail.qq.com',
	    port: 465,
	    auth: {
	      user: '',
	      pass: ''
	    }
		}
	},

	oauth: {
		weibo: {
			appid: 0,
		  appSecret: ''
		},
		qq: {
			appid: 0,
			appkey: ''
		}
	},

	// 上传头像、图片文件到七牛
	qiniu: {
		accessKey: '',
    secretKey: '',
    bucket: '',
    // 七牛的资源地址
    url: ''
	}

};

module.exports = config;
