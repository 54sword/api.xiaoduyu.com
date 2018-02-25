import { Account, User, Captcha, Phone } from '../../modelsa'

import bcrypt from 'bcryptjs';

let query = {};
let mutation = {};
let resolvers = {};

import JWT from '../../common/jwt';
import To from '../../common/to';
import CreateError from './errors';
// import Querys from '../querys';
// import Updates from '../updates';

import { getQuery, getOption } from '../config'

query.signIn = async (root, args, context, schema) => {

  const { user, role, ip, jwtTokenSecret } = context
  const { method } = args

  let select = {}, query = {}, options = {}, err, result, account;

  // let { query, options } = Querys({ args, model: 'account', role })

  [ err, query ] = getQuery({ args, model: 'account', role });

  if (!err) {
    createCaptcha()
    throw CreateError({ message: err });
  }

  [ err, options ] = getOption({ args, model: 'account', role });

  if (!err) {
    createCaptcha()
    throw CreateError({ message: err });
  }

  // -----

  let { email, phone, password, captcha, captcha_id } = query;

  // let err, result, account;

  const createCaptcha = async () => {
    var captcha = Math.round(900000*Math.random()+100000);
    await To(Captcha.save({ data: { captcha, ip } }))
  }

  if (!ip) {
    createCaptcha()
    throw CreateError({ message: '获取不到您的IP' });
  }
  if (!email && !phone) {
    createCaptcha()
    throw CreateError({ message: '需要邮箱或手机号' });
  }

  [ err, result ] = await To(Captcha.findOne({
    query:{ ip: ip },
    select:{ _id: 1 },
    options:{ sort:{ create_at: -1 } }
  }))

  if (err) {
    createCaptcha()
    throw CreateError({ message: '查询验证码失败' });
  }

  if (result && !captcha) {
    createCaptcha()
    throw CreateError({ message: '缺少验证码' });
  } else if (result && !captcha_id) {
    createCaptcha()
    throw CreateError({ message: '缺少验证码ID' });
  }

  if (result && captcha_id && captcha) {

    [ err, result ] = await To(Captcha.findOne({
      query: { _id: captcha_id }
    }));

    if (err || !result || result.captcha != captcha) {
      createCaptcha()
      throw CreateError({ message: '验证码无效' });
    }

  }

  if (phone) {

    [ err, account ] = await To(Phone.findOne({
      query: { phone },
      options: { populate: { path: 'user_id' } }
    }));

    if (err || !account) {
      createCaptcha()
      throw CreateError({ message: '账号错误或不存在' });
    }

  } else if (email) {

    [ err, account ] = await To(Account.findOne({
      query: { email },
      options: { populate: { path: 'user_id' } }
    }));

    if (err || !account) {
      createCaptcha()
      throw CreateError({ message: '账号错误或不存在' });
    }

  } else {

    if (err || !account) {
      createCaptcha()
      throw CreateError({ message: '账号错误或不存在' });
    }

  }

  [ err, result ] = await To(Account.verifyPassword({
    password,
    currentPassword: account.user_id.password
  }))

  if (err || !result) {
    createCaptcha()
    throw CreateError({ message: '密码错误' });
  }

  result = JWT.encode(jwtTokenSecret, account.user_id._id, account.user_id.access_token, ip)

  return {
    user_id: result.user_id,
    access_token: result.access_token
  }

}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
