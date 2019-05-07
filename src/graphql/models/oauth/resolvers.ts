
import { Oauth } from '../../../models';

import To from '../../../utils/to';
import CreateError from '../../common/errors';

import * as QQ from '../../../router/oauth/qq'

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'

// 还缺少通知
const oAuthUnbinding = async (root: any, args: any, context: any, schema: any) => {

  const { user } = context;
  const { name } = args;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  // 查询是否存在
  let [ err, res ] = await To(Oauth.fetchByUserIdAndSource(user._id, name));

  if (err) throw CreateError({ message: '查询失败' });
  if (!res) throw CreateError({ message: '未绑定' });
  
  await To(Oauth.update({
    query: { _id: res._id },
    update: { deleted: true }
  }));

  return {
    success: true
  }

}

// qq 注册&登陆、绑定
const QQOAuth = async (root: any, args: any, context: any, schema: any) => {
  
  const { user, role, ip  } = context;

  let err, res, fields;

  if (!ip) throw CreateError({ message: '无效的ip地址' });

  [ err, fields ] = getSave({ args, model:Model.QQOAuth, role });

  [ err, res ] = await To(QQ.signInAPI({
    ip,
    user,
    token: {
      openid: fields.openid,
      access_token: fields.access_token,
      expires_in: fields.expires_in,
      refresh_token: fields.refresh_token,
      oauth_consumer_key: args.oauth_consumer_key
    }
    // binding: fields.binding || false
  }));

  if (err) throw CreateError({ message: err });

  if (user) {
    return {
      success: true
    }
  } else {
    return {
      success: true,
      access_token: res.access_token,
      expires: res.expires
    }
  }

}

export const query = {}
export const mutation = { oAuthUnbinding, QQOAuth }