
import { Captcha, Account, Phone } from '../../../models';
import config from '../../../../config';
const { domain, debug } = config;

// tools
import To from '../../../utils/to';
import CreateError from '../../common/errors';
import Validate from '../../../utils/validate';
import * as Email from '../../../common/email';
import * as alicloud from '../../../common/alicloud';
import * as yunpian from '../../../common/yunpian';

// data
import Countries from '../../../../config/countries';

import * as Model from './arguments'
import { getQuery, getSave } from '../tools'

// 通过id获取验证码「单元测试环境使用」
const getCaptcha = async (root: any, args: any, context: any, schema: any) => {

  if (!config.debug) {
    throw CreateError({ message: '此API仅测试环境有效' });
  }

  const { user, role, ip } = context;

  let err, res, query;

  [ err, query ] = getQuery({ args, model:Model.getCaptcha, role });

  [ err, res ] = await To(Captcha.findOne({
    query,
    options: { sort:{ create_at: -1 } }
  }));

  if (err) {
    throw CreateError({ message: err });
  } else {
    return res;
  }
}

const addCaptcha = async (root: any, args: any, context: any, schema: any) => {

  const { user, ip, role } = context;

  // 参数声明
  let err, result, fields;

  [ err, fields ] = getSave({ args, model:Model.addCaptcha, role });


  if (err) throw CreateError({ message: err });

  let { email, phone, area_code, type } = fields;

  // =========================
  // 给自己绑定的邮箱发送验证码
  if (type == 'email-unlock-token') {
    if (!user) throw CreateError({ message: '未登陆' });

    [ err, result ] = await To(Account.findOne({ query: { user_id: user._id } }));

    if (err) throw CreateError({ message: err });
    if (!result) throw CreateError({ message: '未绑定邮箱' });

    email = result.email;
  }

  // =========================
  // 给自己绑定的手机发送验证码
  if (type == 'phone-unlock-token') {
    if (!user) throw CreateError({ message: '未登陆' });

    [ err, result ] = await To(Phone.findOne({ query: { user_id: user._id } }));

    if (err) throw CreateError({ message: err });
    if (!result) throw CreateError({ message: '未绑定手机' });
    
    phone = result.phone;
    area_code = result.area_code;
  }

  // =========================
  // 【找回密码】发送给手机账号
  if (type == 'forgot' && phone) {
    [ err, result ] = await To(Phone.findOne({ query: { phone } }));

    if (err) throw CreateError({ message: err });
    if (!result) throw CreateError({ message: '手机号码不存在' });

    phone = result.phone;
    area_code = result.area_code;
  }

  // =========================
  // 【找回密码】发送给手机账号
  if (type == 'forgot' && email) {
    [ err, result ] = await To(Account.findOne({ query: { email } }));

    if (err) throw CreateError({ message: err });
    if (!result) throw CreateError({ message: '邮箱不存在' });
  }



  // =========================
  // 获取图片验证码地址和id
  if (!email && !phone && !area_code) {

    if (type != 'sign-in') {
      throw CreateError({ message: 'type 错误' });
    }

    [ err, result ] = await To(Captcha.findOne({
      query: { ip },
      select: { _id: 1 },
      options: { sort:{ create_at: -1 } }
    }));

    if (!result) return { success: true, _id: '', url: '' };

    [ err, result ] = await To(Captcha.create({ ip, type }));

    return { success: true, _id: result._id, url: domain + '/captcha/' + result._id }

  }
  
  // =========================
  // 发送验证码到邮箱
  if (email && type) {
    [ err, result ] = await To(sendEmail({ user, email, type }));
    if (err) throw CreateError({ message: err });
  }

  // =========================
  // 发送验证码到手机
  if (phone && area_code && type) {
    [ err, result ] = await To(sendSMS({ user, area_code, phone, type }));
    if (err) throw CreateError({ message: err });
  }

  return {
    success: true
  }

}


export const query = { getCaptcha }
export const mutation = { addCaptcha }

// export { query, mutation, resolvers }


interface SendEmail {
  user: any
  email: string
  type: string
}

// 发送验证码到邮箱

const sendEmail = ({ user, email, type }:SendEmail) => {
  return new Promise(async (resolve, reject)=>{

    if (Validate.email(email) != 'ok') {
      return reject('邮箱格式错误');
    }

    let [ err, res ] = await To(Account.findOne({
      query: { email },
      options: {
        populate: [{
          path: 'user_id',
          select: { '_id': 1, 'nickname': 1 }
        }]
      }
    }));

    let nickname = res ? res.user_id.nickname : '';
    let title = '', content = '';

    let data: any = {
      email,
      type
    }

    if (type == 'binding-email') {

      if (!user) return reject('无权访问');
      if (res) return reject('邮箱已经被注册');

      data.user_id = user._id;

      [ err, res ] = await To(Captcha.create(data));

      title = '请输入验证码 '+res.captcha+' 完成绑定邮箱';
      content = '<div style="font-size:18px;">尊敬的 '+nickname+'，您好！</div>'+
                      '<div>您正在绑定小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                      '如下是您的注册验证码:<br />'+
                      '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                      res.captcha+
                      '</span>'+
                      '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>';

    } else if (type == 'sign-up') {

      if (user) return reject('登陆用户不能注册，请退出账户后注册');
      if (res) return reject('邮箱已被注册');

      [ err, res ] = await To(Captcha.create(data));

      title = '请输入验证码 '+res.captcha+' 完成账号注册';
      content = '<div style="font-size:18px;">尊敬的用户，您好！</div>'+
                      '<div>您正在注册小度鱼账号，若不是您本人操作，请忽略此邮件。</div>'+
                      '如下是您的注册验证码:<br />'+
                      '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                      res.captcha+
                      '</span>'+
                      '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>'
    }  else if (type == 'reset-email') {

      if (!user) return reject('无权访问');
      if (res) return reject('邮箱已被注册');

      data.user_id = user._id;

      [ err, res ] = await To(Captcha.create(data));

      title = '请输入验证码 '+res.captcha+' 完成绑定邮箱';
      content = '<div style="font-size:18px;">尊敬的 '+nickname+'，您好！</div>'+
                      '<div>您正在绑定新的小度鱼账号邮箱，若不是您本人操作，请忽略此邮件。</div>'+
                      '如下是您的验证码:<br />'+
                      '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                      res.captcha+
                      '</span>'+
                      '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>'

    } else if (type == 'forgot') {

      if (!res) return reject('邮箱不存在');

      [ err, res ] = await To(Captcha.create(data));

      title = '请输入验证码 '+res.captcha+' 完成找回密码';
      content = '<div style="font-size:18px;">尊敬的 '+nickname+'，您好！</div>'+
                      '<div>您正在操作小度鱼账号密码找回，若不是您本人操作，请忽略此邮件。</div>'+
                      '如下是您的注册验证码:<br />'+
                      '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                      res.captcha+
                      '</span>'+
                      '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>';
    } else if (type == 'email-unlock-token') {

      data.user_id = user._id;

      [ err, res ] = await To(Captcha.create(data));

      title = '请输入验证码 '+res.captcha+' 完成身份验证';
      content = '<div style="font-size:18px;">尊敬的 '+nickname+'，您好！</div>'+
                      '<div>您正在小度鱼操作验证身份，若不是您本人操作，请忽略此邮件。</div>'+
                      '如下是您的注册验证码:<br />'+
                      '<span style="background:#eaffd2; padding:10px; border:1px solid #cbf59e; color:#68a424; font-size:30px; display:block; margin:10px 0 10px 0;">'+
                      res.captcha+
                      '</span>'+
                      '<div>请注意: 为了保障您帐号的安全性，验证码15分钟后过期，请尽快验证!</div>'

    } else {
      return reject('类型错误');
    }

    // 测试环境不发送短信
    if (debug) {
      reject(`测试环境不直接发送邮件，本次验证码为：${res.captcha}`);
      return;
    }

    let mailOptions = {
      to: email,
      subject: title,
      text: content,
      html: generateEmailHTMLContent(content)
    };

    [ err ] = await To(Email.send(mailOptions));
    
    if (err) {
      reject(res);
    } else {
      resolve();
    }

  });
}

const generateEmailHTMLContent = (content: string) => {
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


interface SendSMS {
  user: any
  area_code: string
  phone: string 
  type: string
}

const sendSMS = ({ user, area_code = '', phone, type }:SendSMS) => {

  return new Promise(async (resolve, reject) => {

    let err, res, phoneAccount;

    [ err, phoneAccount ] = await To(Phone.findOne({
      query: { phone }
    }));

    // 判断区号是否有效
    let existAreaCode = false

    Countries.map(item=>{
      if (item.code == area_code) existAreaCode = true
    });

    let data: any = {
      phone,
      type
    }

    if (type == 'binding-phone' || type == 'reset-phone') {

      if (!user) return reject('无权访问');
      if (!existAreaCode) return reject('区号不存在');
      if (phoneAccount) return reject('手机号已被注册');

      data.user_id = user._id;
      data.area_code = area_code;

    } else if (type == 'forgot') {

      if (!phoneAccount) return reject('手机号不存在');

    } else if (type == 'sign-up') {

      if (!existAreaCode) return reject('区号不存在');
      if (phoneAccount) return reject('手机号已被注册');

    } else if (type == 'phone-unlock-token') {

      if (!user) return reject('无权访问');
      data.area_code = area_code;
      data.user_id = user._id;

    } else {
      return reject('type 错误');
    }

    [ err, res ] = await To(Captcha.create(data));

    if (err) {
      throw CreateError({
        message: '添加失败',
        data: { errorInfo: err.message }
      });
    }

    // 发送短信
    let serviceProvider: any = alicloud;
    // 阿里云仅支持国内短信，因此不需要加区号
    let _area_code = '';

    if (phoneAccount && phoneAccount.area_code) {
      area_code = phoneAccount.area_code;
    }

    // 如果不是国内，则使用云片
    if (area_code != '+86') {
      serviceProvider = yunpian;
      _area_code = area_code;
    }

    // 测试环境不发送短信
    if (debug) {
      reject(`测试环境不直接发送短信，本次验证码为：${res.captcha}`);
      return;
    }

    [ err ] = await To(serviceProvider.sendSMS({
      PhoneNumbers: encodeURI(_area_code + phone),
      TemplateParam: { code: res.captcha }
    }));

    if (err) {
      reject(err)
    } else {
      resolve();
    }

  });


}
