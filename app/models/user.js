import bcrypt from 'bcryptjs'
import { User } from '../schemas'
import baseMethod from './base-method'

/**
 * Account 查询类
 * @extends Model
 */

class UserModel extends baseMethod {

  /**
   * 通过用户id和来源条件查询用户
   * @param  {String} userId  用户的id
   * @param  {Int} _source 来源id
   * @return {Object} Promise
   */
   verifyPassword ({ password, currentPassword }) {
     return new Promise((resolve, reject) => {
       bcrypt.compare(password, currentPassword, (err, res)=>{
         err ? reject(err) : resolve(res)
       });
     });
   }

   /**
    * 生成hash密码
    * @param  {String} password
    * @return {String}
    */
   generateHashPassword ({ password }) {
     return new Promise((resolve, reject) => {

       bcrypt.genSalt(10, function(err, salt) {
         if (err) return next(err);

         bcrypt.hash(password, salt, function(err, hash) {
           if (err) return next(err);
           err ? reject(err) : resolve(hash);
         });

       });

     });
   }

}

module.exports = new UserModel(User);
