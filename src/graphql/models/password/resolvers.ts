import bcrypt from 'bcryptjs';
import uuid from 'node-uuid';

import { User } from '../../../models';

// tools
import To from '../../../utils/to';
import CreateError from '../../common/errors';
import Validate from '../../../utils/validate';
import * as JWT from '../../../utils/jwt';

import * as Model from './arguments'
import { getQuery, getSave } from '../tools'

const getHashPassword = (new_password: string) => {
  return new Promise(resolve=>{
      bcrypt.genSalt(10, function(err: any, salt: any) {
        // if (err) return next(err);
        bcrypt.hash(new_password, salt, function(err: any, hash: any) {
          // if (err) return next(err);
          resolve(hash);
        });
      });
  });
}

const updatePassword = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err: any, query, save, result;

  [ err, query ] = getQuery({ args, model: Model.updatePassword, role });
  [ err, save ] = getSave({ args, model: Model.updatePassword, role });

  if (err) throw CreateError({ message: err });

  const { unlock_token } = query;
  const { new_password } = save;

  if (Validate.password(new_password) != 'ok') {
    throw CreateError({ message: '密码格式错误' });
  }

  // =======================
  // 解锁token，身份验证的用户，可以修改自己的邮箱
  let obj = JWT.decode(unlock_token);

  if (obj.expires - new Date().getTime() <= 0 || !obj || !obj.user_id) {
    throw CreateError({ message: '无效的解锁令牌' });
  }

  if (obj.user_id != user._id + '') {
    throw CreateError({ message: '无权修改' });
  };

  let hashPassword = await getHashPassword(new_password);

  [ err, result ] = await To(User.update({
    query: { _id: user._id },
    update: {
      password: hashPassword,
      access_token: uuid.v4()
    }
  }));

  if (err) {
    throw CreateError({
      message: '修改失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}

export const query = { }
export const mutation = { updatePassword }