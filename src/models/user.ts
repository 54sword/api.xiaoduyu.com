import bcrypt from 'bcryptjs'
import { User } from '../schemas'
import baseMethod from './base-method'

/**
 * Account 查询类
 * @extends Model
 */

interface verifyPassword {
  password: string
  currentPassword: string
}

interface generateHashPassword {
  password: string
}

class UserModel extends baseMethod {

  /**
   * 通过用户id和来源条件查询用户
   * @param  {String} userId  用户的id
   * @param  {Int} _source 来源id
   * @return {Object} Promise
   */
  verifyPassword ({ password, currentPassword }: verifyPassword): Promise<object> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, currentPassword, (err: any, res: any)=>{
        err ? reject(err) : resolve(res)
      });
    });
  }

   /**
    * 生成hash密码
    * @param  {String} password
    * @return {String}
    */
  generateHashPassword ({ password }: generateHashPassword): Promise<object> {
    return new Promise((resolve, reject) => {

      bcrypt.genSalt(10, function(err: any, salt: string) {
        if (err) return reject(err);

        bcrypt.hash(password, salt, function(err: any, hash: object) {
          if (err) return reject(err);
          err ? reject(err) : resolve(hash);
        });

      });

    });
  }

}

export default new UserModel(User)
