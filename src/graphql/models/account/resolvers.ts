import { Account, User, Captcha, Phone, Token } from '../../../models'

// tools
import * as JWT from '../../../utils/jwt'
import To from '../../../utils/to'
import CreateError from '../../common/errors'
import Validate from '../../../utils/validate'

import * as Model from './arguments'
import { getQuery, getSave } from '../tools'

// 登录
const signIn = async (root: any, args: any, context: any, schema: any) => {

  // 参数准备 ------------------------------------------------------------------
  
  const { role, ip } = context;

  let query: any = {}, err: any, result: any, account: any;

  // 判断ip是否存在
  if (!ip) {
    throw CreateError({ message: '获取不到您的IP' });
  };

  [ err, query ] = getQuery({ args, model: Model.signIn, role });

  // 判断查询参数是否合法
  if (err) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: err });
  }

  // 业务逻辑 ------------------------------------------------------------------

  let { email, phone, password, captcha, captcha_id } = query;

  if (!email && !phone) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '需要邮箱或手机号' });
  }

  // 判断是否存在验证码，如果有则需要验证验证码 -----------------------

  [ err, result ] = await To(Captcha.findOne({
    query:{ ip: ip },
    select:{ _id: 1 },
    options:{ sort:{ create_at: -1 } }
  }));

  if (err) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '查询验证码失败' });

  } else if (result && !captcha) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '缺少验证码' });

  } else if (result && !captcha_id) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '缺少验证码ID' });

  } else if (result && captcha_id && captcha) {
    // 对比验证码是否有效
    [ err, result ] = await To(Captcha.findOne({
      query: { _id: captcha_id }
    }));

    if (err || !result || result.captcha != captcha) {
      await To(Captcha.create({ ip, type: 'sign-in' }));
      throw CreateError({ message: '验证码无效' });
    }
  }

  // 验证账号和密码 -----------------------

  if (phone) {
    [ err, account ] = await To(Phone.findOne({
      query: { phone },
      options: { populate: { path: 'user_id', justOne: true  } }
    }));

  } else if (email) {
    [ err, account ] = await To(Account.findOne({
      query: { email },
      options: { populate: { path: 'user_id', justOne: true } }
    }));
  }

  if (err || !account) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '账号错误或不存在' });
  }

  // 判断密码是否正确
  [ err, result ] = await To(User.verifyPassword({
    password,
    currentPassword: account.user_id.password
  }))

  if (err || !result) {
    await To(Captcha.create({ ip, type: 'sign-in' }));
    throw CreateError({ message: '密码错误' });
  }

  // 判断是否被拉黑
  if (account.user_id.blocked) {
    throw CreateError({ message: '您的账号被禁止使用' });
  }

  // 生成 access token -----------------------

  result = await Token.create({
    userId: account.user_id._id,
    ip
  });

  return {
    user_id: result.user_id,
    access_token: result.access_token,
    expires: result.expires
  }

}

const addEmail = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err: any, res: any, fields: any, account: any;
  
  [ err, fields ] = getSave({ args, model:Model.addEmail, role });

  if (err) throw CreateError({ message: err });

  const { email, captcha, unlock_token } = fields;

  if (Validate.email(email) != 'ok') {
    throw CreateError({ message: '邮箱格式错误' });
  }

  // =======================
  // 判断邮箱是否被注册
  [ err, account ] = await To(Account.findOne({
    query: { email }
  }));

  if (err) throw CreateError({ message: '查询异常' });
  if (account && account.user_id + '' != user._id + '') throw CreateError({ message: '邮箱已被注册' });

  [ err, account ] = await To(Account.findOne({
    query: { user_id: user._id }
  }));

  if (err) throw CreateError({ message: '查询异常' });

  // =======================
  // 解锁token，身份验证的用户，可以修改自己的邮箱
  if (unlock_token) {
    let obj = JWT.decode(unlock_token);
    if (obj.expires - new Date().getTime() <= 0 || !obj) throw CreateError({ message: '无效的解锁令牌' });
  } else {
    if (account) throw CreateError({ message: '您已绑定了邮箱' });
  }

  // =======================
  // 判断验证码是否有效
  [ err, res ] = await To(Captcha.findOne({
    query: { user_id: user._id, email, captcha, type: account && unlock_token ? 'reset-email' : 'binding-email' },
    options: { sort:{ create_at: -1 } }
  }));

  if (err) throw CreateError({ message: '查询异常' });
  if (!res) throw CreateError({ message: '无效的验证码' });

  if (account && unlock_token) {
    // =======================
    // 更新邮箱
    [ err, res ] = await To(Account.update({
      query: { _id: account._id },
      update: { email }
    }));

    if (err) {
      throw CreateError({
        message: '修改邮箱账户失败',
        data: { errorInfo: err.message }
      });
    }
  } else {
    // =======================
    // 添加邮箱
    [ err, res ] = await To(Account.save({
      data: { email, user_id: user._id + '' }
    }));

    if (err) {
      throw CreateError({
        message: '创建邮箱账户失败',
        data: { errorInfo: err.message }
      });
    }
  }

  // 清除该邮箱的验证码
  [ err, res ] = await To(Captcha.remove({
    query: { email }
  }));

  return { success: true }

}

export const query = { signIn }
export const mutation = { addEmail }