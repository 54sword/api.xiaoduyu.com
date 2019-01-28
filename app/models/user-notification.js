
import { UserNotification } from '../schemas';
import baseMethod from './base-method';
import To from '../common/to';

class Model extends baseMethod {

  // 添加一条用户通知，并触发推送通知
  addOneAndSendNotification({ data }) {
    const self = this;
    return new Promise(async (resolve, reject) => {

      if (!data) return reject('data is null');

      let [ err, res] = await To(self.findOne({ query: data }));

      if (err) return reject(err);
      if (res) {
        await To(self.update({ query: res._id, update: { deleted: false } }));
        resolve(res);
      } else {
        [ err, res ] = await To(self.save({ data }));
        err ? reject(err) : resolve(res);
      }

      // 触发消息，通知该用户查询新通知
      global.io.sockets.emit(data.addressee_id, JSON.stringify({ type:'notification' }));
      // global.io.sockets.emit('notiaction', [data.addressee_id]);
    });
  }
}

let Schemas = new Model(UserNotification);

module.exports = Schemas;


// export default new baseMethod(UserNotification)

/*
var UserNotification = require('../schemas').UserNotification;

exports.save = function(data, callback) {
  new UserNotification(data).save(callback)
}

exports.create = function(data, callback) {
  UserNotification.create(data, function(err){
    if (callback) callback(err)
  })
}

exports.find = function(query, select, options, callback) {
  var find = UserNotification.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.findOne = function(query, select, callback) {
  UserNotification.findOne(query, select).exec(callback)
}

exports.update = function(condition, contents, callback) {
  UserNotification.update(condition, contents, callback);
}

exports.count = function(query, callback) {
  UserNotification.count(query, callback);
}
*/
