import { UserNotification } from '../schemas'
import baseMethod from './base-method'
import To from '@src/utils/to'

import { emit } from '../socket'

class Model extends baseMethod {

  // 添加一条用户通知，并触发推送通知
  addOneAndSendNotification({ data }: any) {
    const self = this;
    return new Promise(async (resolve, reject) => {

      if (!data) return reject('data is null');

      let [ err, res ] = await To(self.findOne({ query: data }));

      if (err) return reject(err);

      if (res) {
        await To(self.update({ query: res._id, update: { deleted: false } }));
        resolve(res);
      } else {
        [ err, res ] = await To(self.save({ data }));
        err ? reject(err) : resolve(res);
      }

      let options: any = [{
        path: 'sender_id',
        model: 'User',
        select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 },
        justOne: true
      }];
      
      if (data.comment_id) {
        options.push({
          path: 'comment_id',
          select: {
            '_id': 1,
            'content_html': 1,
            'create_at': 1,
            'parent_id': 1
          },
          justOne: true
        })
      }

      if (data.comment_id) {
        options.push({
          path: 'posts_id',
          select: {
            '_id': 1,
            'title': 1,
            'create_at': 1
          },
          justOne: true
        })
      }

      [ err, res ] = await To(self.populate({
        collections: data,
        options
      }));

      // 触发消息，通知该用户查询新通知
      emit(data.addressee_id, { type:'notification', data: res })
    });
  }
}

export default new Model(UserNotification)