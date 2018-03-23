import { Account, User, Captcha, Phone } from '../../modelsa'

let [ query, mutation, resolvers ] = [{},{},{}];

import JWT from '../../common/jwt';
import To from '../../common/to';
import CreateError from './errors';

import { getQuery, getOption } from '../config';


// 登录
query.signIn = async (root, args, context, schema) => {

  // 参数准备 ------------------------------------------------------------------

  const { user, role, ip, jwtTokenSecret } = context;
  let query = {}, err, result, account;

  // 判断ip是否存在
  if (!ip) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '获取不到您的IP' });
  }

  // 获取查询参数
  [ err, query ] = getQuery({ args, model: 'account', role });

  // 判断查询参数是否合法
  if (err) {
    await To(Captcha.create(ip));
    throw CreateError({ message: err });
  }

  // 业务逻辑 ------------------------------------------------------------------

  let { email, phone, password, captcha, captcha_id } = query;

  if (!email && !phone) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '需要邮箱或手机号' });
  }

  // 判断是否存在验证码，如果有则需要验证验证码 -----------------------

  [ err, result ] = await To(Captcha.findOne({
    query:{ ip: ip },
    select:{ _id: 1 },
    options:{ sort:{ create_at: -1 } }
  }));

  if (err) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '查询验证码失败' });

  } else if (result && !captcha) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '缺少验证码' });

  } else if (result && !captcha_id) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '缺少验证码ID' });

  } else if (result && captcha_id && captcha) {
    // 对比验证码是否有效
    [ err, result ] = await To(Captcha.findOne({
      query: { _id: captcha_id }
    }));

    if (err || !result || result.captcha != captcha) {
      await To(Captcha.create(ip));
      throw CreateError({ message: '验证码无效' });
    }
  }

  // 验证账号和密码 -----------------------

  if (phone) {
    [ err, account ] = await To(Phone.findOne({
      query: { phone },
      options: { populate: { path: 'user_id' } }
    }));

  } else if (email) {
    [ err, account ] = await To(Account.findOne({
      query: { email },
      options: { populate: { path: 'user_id' } }
    }));
  }

  if (err || !account) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '账号错误或不存在' });
  }

  // 判断密码是否正确
  [ err, result ] = await To(Account.verifyPassword({
    password,
    currentPassword: account.user_id.password
  }))

  if (err || !result) {
    await To(Captcha.create(ip));
    throw CreateError({ message: '密码错误' });
  }

  // 生产 access token -----------------------

  result = JWT.encode(jwtTokenSecret, account.user_id._id, account.user_id.access_token, ip);

  return {
    user_id: result.user_id,
    access_token: result.access_token
  }

}

mutation.signUp = () => ({ success: true })
mutation.sendCaptchaToEmail = () => ({ success: true })
mutation.bindingEmail = (root, args, context, schema) => {
  // console.log(root);
  // console.log(args);
  // console.log(context);
  // console.log(schema);
  return {
    success: true
  }
}
mutation.resetPasswordByCaptcha = () => ({ success: true })
mutation.resetEmail = () => ({ success: true })
mutation.checkEmailAndSendCaptcha = () => ({ success: true })

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
