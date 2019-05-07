
import config from '../../config'
import SendCloud from 'sendcloud-client'

let sendCloudConfig = config.email.sendCloud

let client: any

if (sendCloudConfig &&
  sendCloudConfig.from &&
  sendCloudConfig.apiUser &&
  sendCloudConfig.apiKey
  ) {
  client = SendCloud.create({
    from: config.name+' <'+sendCloudConfig.from+'>',
    apiUser: sendCloudConfig.apiUser,
    apiKey: sendCloudConfig.apiKey
  });
}

interface Param {
  to: string
  subject: string
  text: string
  html: string
}

export const send = (param: Param): Promise<any> => {
  return new Promise((resolve, reject)=>{
    
    if (!client) {
      return reject('没有配置SendCloud')
    }

    let res = client.send({
      to: [param.to],
      subject: param.subject,
      html: param.html || param.text
    });

    if (res.message == 'success') {
      resolve();
    } else {
      reject(JSON.stringify(res));
    }

  })
}

/*
var nodemailer = require("nodemailer");
var config = require('../../configs/settings');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
  host: config.mail_opts.host,
  secureConnection: true, // 使用 SSL
  use_authentication: true,  //使用qq等邮箱需要配置
  port: config.mail_opts.port, // SMTP 端口
  auth: {
    user: config.mail_opts.auth.user,
    pass: config.mail_opts.auth.pass
  }
});

// 发送邮件
exports.send = function(options, callback){
  smtpTransport.sendMail({
    from: config.name+" <"+config.mail_opts.auth.user+">",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html // html body
  }, callback);
};
*/
