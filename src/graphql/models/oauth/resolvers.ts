
import { Oauth } from '../../../models';

import To from '../../../utils/to';
import CreateError from '../../common/errors';

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

export const query = {}
export const mutation = { oAuthUnbinding }