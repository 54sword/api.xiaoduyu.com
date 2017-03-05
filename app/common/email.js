
var config = require('../../config');
var SendCloud = require('sendcloud-client');

var sendCloudConfig = config.email.sendCloud;

if (sendCloudConfig.from) {
  var client = SendCloud.create({
    from: config.name+' <'+sendCloudConfig.from+'>',
    apiUser: sendCloudConfig.apiUser,
    apiKey: sendCloudConfig.apiKey
  });
}

exports.send = function(options, callback){

  if (sendCloudConfig.from) {
    var options = {
      to: [options.to],
      subject: options.subject,
      html: options.html || options.text
    };
    var res = client.send(options);
    callback(res);
  } else {
    callback(false);
  }

};

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
