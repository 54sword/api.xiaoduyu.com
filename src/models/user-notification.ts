import { UserNotification } from '../schemas'
import baseMethod from './base-method'
import To from '../utils/to'

import { emit } from '../socket'

class Model extends baseMethod {

  // 添加一条用户通知，并触发推送通知
  addOneAndSendNotification({ data }: any) {
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
      emit(data.addressee_id, { type:'notification' })
    });
  }
}

export default new Model(UserNotification)