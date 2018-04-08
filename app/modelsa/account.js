
import bcrypt from 'bcryptjs'
import { Account } from '../schemas'
import baseMethod from './base-method'


/**
 * Account 查询类
 * @extends Model
 */

class AccountModel extends baseMethod {

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


module.exports = new AccountModel(Account);


/*
var Account = require('../schemas').Account;
var bcrypt = require('bcryptjs');

exports.find = function(query, select, options, callback) {
  var find = Account.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.create = function(info, callback) {
  var account = new Account();
  account.email = info.email;
  // account.password = info.password;
  account.user_id = info.user_id;
  account.save(callback);
};

// 通过邮箱查找一个用户
exports.fetchByEmail = function(email, callback) {
  Account.findOne({ email: email })
  .populate([
    {
      path: 'user_id'
    }
  ])
  .exec(callback);
};

// 通过用户的id查找
exports.fetchByUserId = function(userId, callback) {
  Account.findOne({ user_id: userId })
  .populate([
    {
      path: 'user_id'
    }
  ])
  .exec(callback);
};

// 验证密码是否正确
exports.verifyPassword = function(password, currentPassword, callback) {
  bcrypt.compare(password, currentPassword, function(err, res){
    if (err) console.log(err);
    callback(res ? true : false);
  });
};

// 更新邮箱
exports.updateEmail = function(id, email, callback) {
  Account.update({ _id: id }, { email: email }).exec(callback);
};


// 重置密码
exports.resetPassword = function(id, newPassword, callback) {

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(newPassword, salt, function(err, hash) {
      if (err) return callback(err);

      var conditions = { _id: id },
          update = { $set: { password: hash, salt: salt } },
          options = { upsert: true };

      Account.update(conditions, update, options, function(err){
        callback(err, hash);
      });

    });
  });

};
*/
