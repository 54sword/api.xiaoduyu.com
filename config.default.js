
var config = {
	// 调试
	debug: true,
	// 社区名称
	name: '小度鱼',

	// 必须填写
	jwt_secret: '',

	// mongodb 配置
	db_url: 'mongodb://location:27017/xiaoduyu',
	// 域名
	host: 'location',
	// 端口
	port: 3000,
	// 网站的域名
	domain: 'http://location:3000',
	// 联系邮箱，发送出去的邮件中有使用到
	contactEmail: '',

	// 第三方发送邮件服务
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

	// 第三方登录
	oauth: {
		weibo: {
			appid: 0,
		  appSecret: ''
		},
		qq: {
			appid: 0,
			appkey: ''
		},
		// 授权成功后跳转到着陆网站
		landingPage: ''
	},

	// 上传头像、图片文件到七牛
	// 必填否则将无法使用上传图片功能
	qiniu: {
		accessKey: '',
    secretKey: '',
    bucket: '',
    // 七牛的资源地址
    url: ''
	},

	// https 用于域名的验证的路径（选填）
	// https://github.com/xdtianyu/scripts/blob/master/lets-encrypt/README-CN.md
	sslPath: ''

};

module.exports = config;
