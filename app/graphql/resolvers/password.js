import { User } from '../../models';

// 依赖
import bcrypt from 'bcryptjs';
import uuid from 'node-uuid';

// tools
import To from '../../common/to';
import CreateError from '../common/errors';
import Validate from '../../common/validate';
import JWT from '../../common/jwt';

// graphql
import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];

// bcrypt.genSalt(10, function(err, salt) {
//   if (err) return next(err);
//   bcrypt.hash('123123', salt, function(err, hash) {
//     if (err) return next(err);
//     console.log(hash);
//   });
// });

/*
const getHashPassword = ({ current_password, new_password, user_password }) => {

  return new Promise(resolve=>{

    bcrypt.compare(current_password, user_password, (err, res) => {
      if (err) console.log(err);
      if (!res) return resolve(['当前密码错误']);

      bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(new_password, salt, function(err, hash) {
          if (err) return next(err);
          resolve(['', hash]);
        });
      });

    });
  });

}
*/

const getHashPassword = ({ new_password }) => {
  return new Promise(resolve=>{
      bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(new_password, salt, function(err, hash) {
          if (err) return next(err);
          resolve(['', hash]);
        });
      });
  });
}

mutation.updatePassword = async (root, args, context, schema) => {

  const { user, role, jwtTokenSecret } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, result, query, hasPassword;

  [ err, query ] = getUpdateQuery({ args, model:'password', role });
  if (err) throw CreateError({ message: err });

  const { unlock_token, new_password } = query;

  if (Validate.password(new_password) != 'ok') {
    throw CreateError({ message: '密码格式错误' });
  }

  // =======================
  // 解锁token，身份验证的用户，可以修改自己的邮箱
  let obj = JWT.decode(unlock_token, jwtTokenSecret);

  if (obj.expires - new Date().getTime() <= 0 || !obj || !obj.user_id) {
    throw CreateError({ message: '无效的解锁令牌' });
  }

  if (obj.user_id != user._id + '') {
    throw CreateError({ message: '无权修改' });
  }

  [ err, hasPassword ] = await getHashPassword({
    new_password
  });
  
  if (err) {
    throw CreateError({ message: err });
  }

  [ err, result ] = await To(User.update({
    query: { _id: user._id },
    update: {
      password: hasPassword,
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

/*
mutation.updatePassword = async (root, args, context, schema) => {

  const { user, role } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, result, query, hasPassword;

  [ err, query ] = getUpdateQuery({ args, model:'password', role });
  if (err) throw CreateError({ message: err });

  const { user_id, current_password, new_password } = query;

  if (user._id + '' != user_id) {
    throw CreateError({ message: '无权修改' });
  }

  if (current_password == new_password) {
    throw CreateError({ message: '密码不能相同' });
  }

  if (Validate.password(new_password) != 'ok') {
    throw CreateError({ message: '密码格式错误' });
  }

  [ err, hasPassword ] = await getHashPassword({
    current_password,
    new_password,
    user_password: user.password
  });

  if (err) {
    throw CreateError({ message: err });
  }

  [ err, result ] = await To(User.update({
    query: { _id: user._id },
    update: {
      password: hasPassword,
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
*/

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
