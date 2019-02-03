
import { Oauth } from '../../models';
// import { domain } from '../../../config';

let query = {};
let mutation = {};
let resolvers = {};

import To from '../../utils/to';
import CreateError from '../common/errors';
// import { getSaveFields } from '../config';

// 还缺少通知
mutation.oAuthUnbinding = async (root, args, context, schema) => {

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

export { query, mutation, resolvers }