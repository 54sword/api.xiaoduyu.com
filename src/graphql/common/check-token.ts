
import * as JWT from '../../utils/jwt';
import Token from '../../models/token';
import User from '../../models/user';
import To from '../../utils/to';

export default ({ token = '', role = '' }): any => {
  return new Promise(async resolve=>{

    let decoded = JWT.decode(token);
    
    // 解析错误
    if (!decoded) return resolve({})
  
    if (decoded && decoded.expires && decoded.expires < new Date().getTime()) {
      return resolve({})
    }
  
    let [ err, result ] = await To(Token.findOne({
      query: { user_id: decoded.user_id, token: token },
      select: {},
      options: {
        populate: {
          path: 'user_id'
        }
      }
    }));
  
    if (err || !result || !result.user_id) return resolve({})
  
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

    return resolve({ user, role })

  })
}
