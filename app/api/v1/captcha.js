var Captcha = require('../../models').Captcha;
var Account = require('../../models').Account;
var async = require('async');
var Email = require('../../common/email');
var config = require('../../../config');
var Validate = require('../../common/validate');

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

exports.add = function(req, res) {

  var user = req.user,
      email = req.body.email,
      type = req.body.type

  async.waterfall([

    function(callback) {
      if (Validate.email(email) != 'ok') {
        callback(13012)
      } else {
        callback(null)
      }
    },

    function(callback) {

      var code = Math.round(900000*Math.random()+100000);

      if (type == 'binding-email') {

        if (!user) {
          callback(13000)
          return
        }

        if (!email) {
          callback(13005)
          return
        }

        Account.fetchByEmail(email, function(err, account){
          if (err) console.log(err);
          if (!account) {
            // 创建一个验证码
            Captcha.add({ email: email, captcha: code, user_id: user._id }, function(err){
              if (err) console.log(err)

              var title = '请输入验证码 '+code+' 完成绑定邮箱';

              var content = '<div style="font-size:18px;">尊敬的 '+user.nickname+'，您好！</div>'+
                              '<div>您正在绑定小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                              '如下是您的注册验证码:<br />'+
                              '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                              code+
                              '</span>'+
                              '<div>请注意: 为了保障您帐号的安全性，验证码1小时后过期，请尽快验证!</div>';

              callback(null, title, content)
            })
          } else {
            callback(13009);
          }
        });

      } else if (type == 'signup') {
        Account.fetchByEmail(email, function(err, account){
          if (err) console.log(err);
          if (!account) {
            Captcha.addEmail(email, code, function(err){
              if (err) console.log(err)
              // callback(null, email, code)

              var title = '请输入验证码 '+code+' 完成账号注册';

              var content = '<div style="font-size:18px;">尊敬的 '+email+'，您好！</div>'+
                              '<div>您正在注册小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                              '如下是您的注册验证码:<br />'+
                              '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                              code+
                              '</span>'+
                              '<div>请注意: 为了保障您帐号的安全性，验证码1小时后过期，请尽快验证!</div>';

              callback(null, title, content)

            })
          } else {
            callback(13009);
          }
        });
      } else if (type == 'forgot') {

        if (!email) {
          callback(13005)
          return
        }

        Account.fetchByEmail(email, function(err, account){
          if (err) console.log(err);
          if (account) {
            Captcha.addEmail(email, code, function(err){
              if (err) console.log(err)
              // callback(null, email, code)

              var title = '请输入验证码 '+code+' 完成找回密码';

              var content = '<div style="font-size:18px;">尊敬的 '+account.user_id.nickname+'，您好！</div>'+
                              '<div>您正在操作小度鱼账号密码找回，若不是您本人操作，请忽略此邮件。</div>'+
                              '如下是您的注册验证码:<br />'+
                              '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                              code+
                              '</span>'+
                              '<div>请注意: 为了保障您帐号的安全性，验证码1小时后过期，请尽快验证!</div>';

              callback(null, title, content)

            })
          } else {
            callback(13000);
          }
        });
      } else if (type == 'reset-email') {

        if (!user) {
          callback(13000)
          return
        }

        if (!email) {
          callback(13005)
          return
        }

        Captcha.add({
          email: email,
          captcha: code,
          user_id: user._id
        }, function(err){
          if (err) console.log(err)

          var title = '请输入验证码 '+code+' 完成绑定邮箱';

          var content = '<div style="font-size:18px;">尊敬的 '+user.nickname+'，您好！</div>'+
                          '<div>您正在绑定新的小度鱼账号邮箱，若不是您本人操作，请忽略此邮件。</div>'+
                          '如下是您的注册验证码:<br />'+
                          '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                          code+
                          '</span>'+
                          '<div>请注意: 为了保障您帐号的安全性，验证码1小时后过期，请尽快验证!</div>';

          callback(null, title, content)

          // callback(null, email, code)
        })
      } else {
        callback(10005)
      }

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

      // console.log(mailOptions)
      // callback(null);

      Email.send(mailOptions, function(err, response){

        if (err.message != 'success') {
          callback(13016);
        } else {
          callback(null);
        }
      });

    }

  ], function(err, result){

    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    res.send({ success: true });
  });

};
