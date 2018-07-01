
import JWT from '../../common/jwt';
import Token from '../../modelsa/token';
import User from '../../modelsa/user';
import To from '../../common/to';

export default async ({ token = '', role = '', jwtTokenSecret = '' }) => {

  let decoded = JWT.decode(token, jwtTokenSecret);

  // 解析错误
  if (!decoded) return {}

  if (decoded && decoded.expires && decoded.expires < new Date().getTime()) {
    return {}
  }

  let [ err, result ] = await To(Token.findOne({
    query: { user_id: decoded.user_id, token: token },
    select: {},
    options: {
      populate: {
        path: 'user_id'
      }
    }
  }))

  if (err || !result) return {}

  let user = result.user_id;

  // 如果是管理员，并且是admin
  if (user.role == 100 && role == 'admin') {
    role = 'admin'
  } else {
    role = ''
  }

  // 最近登录时间，根据请求时间，每5分钟更新一次
  if (new Date().getTime() - new Date(user.last_sign_at).getTime() > 1000 * 60 * 5) {
    await To(User.update({
      query: { _id: user._id },
      update: { last_sign_at: new Date() }
    }))
  }

  return { user, role }

}
