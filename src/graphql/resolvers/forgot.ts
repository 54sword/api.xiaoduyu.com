
import { Account, Captcha, User, Phone } from '../../models';

// tools
import To from '../../utils/to';
import CreateError from '../common/errors';

// graphql
import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];


// 还缺少通知
mutation.forgot = async (root, args, context, schema) => {
  
  const { role } = context;
  const { method } = args;

  let select = {}, err, query, update, user, hash, res, fields;

  [ err, fields ] = getUpdateQuery({ args, model:'forgot', role });

  const { phone, email, captcha, new_password } = fields;

  if (!phone && !email) {
    throw CreateError({ message: '手机或邮箱，两个必填一项' });
  }

  if (email) {

    [ err, user ] = await To(Account.findOne({
      query: { email }
    }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (!user) {
      throw CreateError({ message: '邮箱不存在' });
    }

  } else if (phone) {

    [ err, user ] = await To(Phone.findOne({
      query: { phone }
    }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (!user) {
      throw CreateError({ message: '手机号不存在' });
    }

  }

  [ err, res ] = await To(Captcha.findOne({
    query: email ? { email, type: 'forgot', captcha } : { phone, type: 'forgot', captcha },
    options: { sort:{ create_at: -1 } }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!res) {
    throw CreateError({ message: '验证码无效' });
  }

  [ err, hash ] = await To(User.generateHashPassword({ password: new_password }));

  [ err ] = await To(User.update({
    query: { _id: user.user_id },
    update: { password: hash }
  }));

  if (err) {
    throw CreateError({
      message: '密码修改失败',
      data: { errorInfo: err.message }
    });
  }

  // 返回
  return {
    success: true
  }
}

export { query, mutation, resolvers }
