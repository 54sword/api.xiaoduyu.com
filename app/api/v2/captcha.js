


import { Captcha, Account, Phone } from '../../models'

var async = require('async');
var Email = require('../../common/email');
var alicloud = require('../../common/alicloud');
var yunpian = require('../../common/yunpian');
var config = require('../../../config');
var Validate = require('../../common/validate');
var captchapng = require('captchapng');
var Tools = require('../../common/tools');

import Countries from '../../data/countries'


var generateEmailHTMLContent = function(content) {

  return '<table width="100%" height="100%" bgcolor="#e0e0e0" style="min-width: 348px; font-family: \'Helvetica Neue\', \'Luxi Sans\', \'DejaVu Sans\', Tahoma, \'Hiragino Sans GB\', \'Microsoft Yahei\', sans-serif;" border="0" cellspacing="0" cellpadding="0">'+
    '<tr height="32px"></tr>'+
    '<tr align="center">'+
      '<td width="32px"></td>'+
      '<td>'+
        '<table style="max-width: 600px;" width="100%" border="0" cellspacing="0" cellpadding="0">'+
          '<tr>'+
            '<td>'+
              '<table style="border-top-left-radius: 3px; border-top-right-radius: 3px;" bgcolor="#25a716" width="100%" border="0" cellspacing="0" cellpadding="0">'+
                '<tr><td height="25px"></td></tr>'+
                '<tr>'+
                  '<td width="32px"></td>'+
                  '<td style="font-size:24px; color:#fff;">'+
                    config.name+
                  '</td>'+
                  '<td width="100px" align="center">'+
                  '</td>'+
                '</tr>'+
                '<tr><td height="15px"></td></tr>'+
              '</table>'+
            '</td>'+
          '</tr>'+
          '<tr>'+
            '<td>'+
              '<table style="border-bottom: 1px solid #eeeeee;" bgcolor="#fff"  width="100%" border="0" cellspacing="0" cellpadding="0">'+
                '<tr><td height="30px"></td></tr>'+
                '<tr>'+
                  '<td width="32px"></td>'+
                  '<td style="padding:0px; font-size:14px; color:#888;">'+
                    content+
                  '</td>'+
                  '<td width="32px"></td>'+
                '</tr>'+
                '<tr><td height="30px"></td></tr>'+
              '</table>'+
            '</td>'+
          '</tr>'+
          '<tr>'+
            '<td>'+
              '<table style="border-bottom-left-radius: 3px; border-bottom-right-radius: 3px;" bgcolor="#fdfdfd" width="100%" border="0" cellspacing="0" cellpadding="0">'+
                '<tr><td height="20px"></td></tr>'+
                '<tr>'+
                  '<td width="32px"></td>'+
                  '<td style="font-size:12px; color:#888; line-height:22px; word-break:break-all;">'+
                    '此电子邮件地址无法接收回复。要就此提醒向我们提供反馈，<a href="mailto:54sword@gmail.com?subject=问题反馈[小度鱼]" style="color:#14a0f0; text-decoration: none;" target="_blank">请点击此处。</a><br />'+
                    '如需更多信息，请访问 <a href="http://www.xiaoduyu.com" style="color:#14a0f0; text-decoration: none;" target="_blank">小度鱼</a>。'+
                  '</td>'+
                  '<td width="32px"></td>'+
                '</tr>'+
                '<tr><td height="20px"></td></tr>'+
              '</table>'+
            '</td>'+
          '</tr>'+
        '</table>'+
      '</td>'+
      '<td width="32px"></td>'+
    '</tr>'+
    '<tr height="32px"></tr>'+
  '</table>';
}


const sendEmail = ({ user, email, type, callback }) => {

  async.waterfall([

    function(callback) {
      if (!email) return callback(13005)
      if (Validate.email(email) != 'ok') return callback(13012)
      callback(null)
    },

    function(callback) {
      Account.fetchByEmail(email, function(err, account){
        if (err) console.log(err)
        callback(null, account)
      })
    },

    function(account, callback) {

      const code = Math.round(900000*Math.random()+100000)

      let data = {
        email,
        captcha: code
      }

      if (type == 'binding-email' || type == 'reset-email') {
        if (!user) return callback(13000)
        data.user_id = user._id
      }

      if (type == 'binding-email') {

        if (!user) return callback(13000)
        if (account) return callback(13009)

        var title = '请输入验证码 '+code+' 完成绑定邮箱';
        var content = '<div style="font-size:18px;">尊敬的 '+user.nickname+'，您好！</div>'+
                        '<div>您正在绑定小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                        '如下是您的注册验证码:<br />'+
                        '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                        code+
                        '</span>'+
                        '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>';

      } else if (type == 'signup') {

        if (account) return callback(13009)

        var title = '请输入验证码 '+code+' 完成账号注册';
        var content = '<div style="font-size:18px;">尊敬的 '+email+'，您好！</div>'+
                        '<div>您正在注册小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                        '如下是您的注册验证码:<br />'+
                        '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                        code+
                        '</span>'+
                        '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>';

      } else if (type == 'forgot') {

        if (!account) return callback(13000)

        var title = '请输入验证码 '+code+' 完成找回密码';
        var content = '<div style="font-size:18px;">尊敬的 '+account.user_id.nickname+'，您好！</div>'+
                        '<div>您正在操作小度鱼账号密码找回，若不是您本人操作，请忽略此邮件。</div>'+
                        '如下是您的注册验证码:<br />'+
                        '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                        code+
                        '</span>'+
                        '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>';

      } else if (type == 'reset-email') {

        if (!user) return callback(13000)

        var title = '请输入验证码 '+code+' 完成绑定邮箱';
        var content = '<div style="font-size:18px;">尊敬的 '+user.nickname+'，您好！</div>'+
                        '<div>您正在绑定新的小度鱼账号邮箱，若不是您本人操作，请忽略此邮件。</div>'+
                        '如下是您的验证码:<br />'+
                        '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                        code+
                        '</span>'+
                        '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>'

      } else {
        return callback(10005)
      }

      Captcha.save({
        data,
        callback: function(err){
          if (err) console.log(err)
          callback(null, title, content)
        }
      })

    },

    function(title, content, callback) {

      var subject = title;
      var textContent = content;
      var htmlContent = generateEmailHTMLContent(content);

      var mailOptions = {
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent // html body
      };

      Email.send(mailOptions, function(err, response){

        if (err.message != 'success') {
          callback(13016);
        } else {
          callback(null);
        }
      });

    }

  ], callback);

}

const sendSMS = ({ user, areaCode, phone, type, callback }) => {

  async.waterfall([

    function(callback) {
      if (!phone) return callback(30001)
      if (!type) return callback(10005)
      callback(null)
    },

    function(callback) {
      Phone.findOne({
        query: { phone },
        callback: (err, res) => {
          if (err) console.log(err)
          callback(null, res)
        }
      })
    },

    function(phoneAccount, callback) {

      const code = Math.round(900000*Math.random()+100000)

      let data = {
        phone,
        captcha: code
      }

      // 判断区号是否有效
      let existAreaCode = false

      Countries.map(item=>{
        if (item.code == areaCode) existAreaCode = true
      })

      if (type == 'binding-phone' || type == 'reset-phone') {
        // 未登陆
        if (!user) return callback(13000)
        // 账号已经存在
        if (phoneAccount) return callback(30002)
        // 区号不存在
        if (!existAreaCode) return callback(30004)

        data.user_id = user._id
        data.area_code = areaCode

      } else if (type == 'forgot') {
        // 账号不存在
        if (!phoneAccount) return callback(30002)
      } else if (type == 'signup') {
        // 账号已存在
        if (phoneAccount) return callback(30002)
        // 区号不存在
        if (!existAreaCode) return callback(30004)
      } else {
        return callback(10005)
      }

      Captcha.save({
        data,
        callback: (err, result) => {
          if (err) console.log(err);
          callback(null, code, phoneAccount)
        }
      })

    },

    function(code, phoneAccount, callback) {

      let serviceProvider = alicloud
      // 阿里云仅支持国内短信，因此不需要加区号
      let _areaCode = ''

      if (phoneAccount && phoneAccount.area_code) {
        areaCode = phoneAccount.area_code
      }

      if (areaCode != '+86') {
        serviceProvider = yunpian
        _areaCode = areaCode
      }

      serviceProvider.sendSMS({
        PhoneNumbers: encodeURI(_areaCode + phone),
        SignName: config.alicloud.sms.signName,
        TemplateCode: config.alicloud.sms.templateCode,
        TemplateParam: { code }
      }, callback)

    }

  ], callback);

}

exports.add = function(req, res) {

  var user = req.user,
      email = req.body.email || '',
      phone = req.body.phone || '',
      areaCode = req.body.area_code || '',
      type = req.body.type
      // ip = Tools.getIP(req)

  if (email) {
    sendEmail({
      user,
      email,
      type,
      callback: (err, result)=>{

        if (err) {
          // 账号的邮箱已经验证
          res.status(400);
          return res.send({
            success: false,
            error: err
          });
        }

        res.send({ success: true });
      }
    })
  } else if (phone) {

    sendSMS({
      user,
      areaCode,
      phone,
      type,
      callback: (err)=>{

        if (err) {
          // 账号的邮箱已经验证
          res.status(400);
          return res.send({
            success: false,
            error: err
          });
        }

        res.send({ success: true });
      }
    })
  } else {
    res.send({
      success: false,
      error: 10005
    })
  }

};


exports.getCaptchaId = function(req, res, next) {

  const ip = Tools.getIP(req);

  async.waterfall([

    callback => {
      // 获取验证码
      let s = Captcha.findOne({
        query: { ip },
        select: { _id: 1 },
        options: { sort:{ create_at: -1 } },
        callback: (err, result) => {
          if (err) console.log(result);
          if (!result) return callback({ success: true, data: '' })
          callback(null)
        }
      })
    },

    // callback => {
    //   // 删除所有该ip的验证码
    //   Captcha.remove({ conditions: { ip }, callback: err => callback(null) })
    // },

    callback => {
      // 保存验证码
      Captcha.save({
        data: { captcha: Math.round(900000*Math.random()+100000), ip },
        callback: (err, result) => {
          if (err) console.log(err)
          callback({ success: true, data: result ? result._id : '' })
        }
      })

    }

  ], result => res.send(result))
}


exports.showImage = function(req, res, next){

  const id = req.params.id;

  Captcha.findOne({
    query: { _id: id },
    callback: (err, result) => {
      if (err) console.log(err);

      if (!result) {
        // 账号的邮箱已经验证
        res.status(404);
        return res.send({ success: false })
      }

      var p = new captchapng(80,30,result.captcha); // width,height,numeric captcha
          p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
          p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

      var img = p.getBase64();
      var imgbase64 = new Buffer(img,'base64');
      res.writeHead(200, { 'Content-Type': 'image/png' });

      res.end(imgbase64);
    }
  })

};
