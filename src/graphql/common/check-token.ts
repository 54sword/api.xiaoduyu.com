import * as JWT from '../../utils/jwt';
import coverString from '../../utils/cover-string';
import { Token, User, Account, Oauth, Phone } from '../../models';


import To from '../../utils/to';
import cache from '../../common/cache';

export default ({ token = '', role = '' }): any => {
  return new Promise(async resolve=>{

    let decoded = JWT.decode(token);
    let userId = decoded.user_id;
    
    // 解析错误
    if (!decoded) return resolve({})
    
    // token已过期
    if (decoded && decoded.expires && decoded.expires < new Date().getTime()) {
      return resolve({})
    }

    let err: any, result: any = cache.get(userId), user: any;

    if (!result) {
      
      [ err, result ] = await To(Token.findOne({
        query: { user_id: userId, token: token },
        select: {},
        options: {
          populate: {
            path: 'user_id'
          }
        }
      }));

      if (err || !result || !result.user_id) return resolve({});

      user = result.user_id;

      // 获取用户绑定了那些账号
      await Promise.all([
        To(Account.findOne({ query: { user_id: user._id } })),
        To(Oauth.fetchByUserIdAndSource(user._id, 'weibo')),
        To(Oauth.fetchByUserIdAndSource(user._id, 'qq')),
        To(Oauth.fetchByUserIdAndSource(user._id, 'github')),
        To(Phone.findOne({ query: { user_id: user._id } }))
      ]).then(function([[, account], [,weibo], [,qq], [,github], [,phone] ]){
    
        if (account) {
          var arr = account.email.split("@");
          var email = coverString(arr[0])+'@'+arr[1];
          user.email = email;
        } else {
          user.email = '';
        }
    
        user.weibo = weibo && weibo.deleted == false ? true : false;
        user.qq = qq && qq.deleted == false ? true : false;
        user.github = github && github.deleted == false ? true : false;
        user.phone = phone ? coverString(phone.phone + '') : '';
        user.area_code = phone ? phone.area_code : '';
      });
    
      user.has_password = user.password ? true : false;

      result.user_id = user;
      
      // 记录用户最近一次请求api的日期
      await To(User.updateOne({
        query: { _id: user._id },
        update: { last_sign_at: new Date() }
      }))

      cache.set(userId, result); 
    } else {
      user = result.user_id;
    }
  
    // 如果是管理员，并且是admin
    if (user.role == 100 && role == 'admin') {
      role = 'admin'
    } else {
      role = ''
    }
  
    // 最近登录时间，根据请求时间，每5分钟更新一次
    // if (new Date().getTime() - new Date(user.last_sign_at).getTime() > 1000 * 60 * 5) {
    //   await To(User.updateOne({
    //     query: { _id: user._id },
    //     update: { last_sign_at: new Date() }
    //   }))
    // }

    return resolve({ user, role })

  })
}
