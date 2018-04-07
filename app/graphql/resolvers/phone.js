
import { Phone, User, Captcha } from '../../modelsa';

// tools
import Countries from '../../data/countries';

import To from '../../common/to'
import CreateError from './errors'

// graphql
import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];


/**
 * 绑定手机号
 */
mutation.addPhone = async (root, args, context, schema) => {

  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, res, fields;

  [ err, fields ] = getSaveFields({ args, model:'phone', role });

  if (err) throw CreateError({ message: err });

  const { phone, captcha, area_code } = fields;

  // 手机区域代码验证
  let existAreaCode = false;

  Countries.map(item=>{
    if (item.code == area_code) existAreaCode = true;
  });

  if (!existAreaCode) throw CreateError({ message: '区号不存在' });

  // 验证验证码
  [ err, res ] = await To(Captcha.findOne({
    query: { user_id: user._id, phone, area_code, captcha }
  }));

  if (err) throw CreateError({ message: '查询失败' });
  if (!res) throw CreateError({ message: '无效的验证码' });


  // 手机号是否被注册
  [ err, res ] = await To(Phone.findOne({
    query: {
      '$or': [{ user_id: user._id }, { phone }]
    }
  }));

  if (err) throw CreateError({ message: '查询失败' });
  if (res && res.user_id + '' == user._id + '') throw CreateError({ message: '已经绑定过手机' });
  if (res) throw CreateError({ message: '手机号已经被注册' });

  // 储存
  [ err, res ] = await To(Phone.save({
    data: { user_id: user._id + '', phone, area_code }
  }));

  if (err) throw CreateError({ message: '添加失败' });

  // 删除该用户所有的手机手机验证码
  [ err, res ] = await To(Captcha.remove({
    query: { user_id: user._id, phone }
  }));

  return { success: true }
}



mutation.updatePhone = async (root, args, context, schema) => {

  const { user, role } = context;
  
  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, res, fields;

  [ err, fields ] = getSaveFields({ args, model:'phone', role });

  if (err) throw CreateError({ message: err });

  const { phone, captcha, area_code } = fields;

  // 手机区域代码验证
  let existAreaCode = false;

  Countries.map(item=>{
    if (item.code == area_code) existAreaCode = true;
  });

  if (!existAreaCode) throw CreateError({ message: '区号不存在' });

  // 验证验证码
  [ err, res ] = await To(Captcha.findOne({
    query: { user_id: user._id, phone, area_code, captcha }
  }));

  if (err) throw CreateError({ message: '查询失败' });
  if (!res) throw CreateError({ message: '无效的验证码' });


  // 手机号是否被注册
  [ err, res ] = await To(Phone.findOne({
    query: { phone }
  }));

  if (err) throw CreateError({ message: '查询失败' });
  if (res) throw CreateError({ message: '手机号已经被注册' });

  // 用户是否绑定过手机
  [ err, res ] = await To(Phone.findOne({
    query: { user_id: user._id }
  }));

  if (err) throw CreateError({ message: '查询失败' });
  if (!res) throw CreateError({ message: '未绑定手机号' });

  // 更新手机
  [ err, res ] = await To(Phone.update({
    query: { user_id: user._id },
    update: { phone, area_code }
  }));

  if (err) throw CreateError({ message: '更新失败' });

  // 删除该用户所有的手机手机验证码
  [ err, res ] = await To(Captcha.remove({
    query: { user_id: user._id, phone }
  }));

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
