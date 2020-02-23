import { User, Live } from '@src/models'

import To from '@src/utils/to'
import CreateError from '../../common/errors';

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'
import { getAudienceCountByLiveId, getViewCountByLiveId } from '@src/socket/live';
import { getTalkCountByLiveId } from '@src/socket/message';

const live = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let select: any = {}, err, list: any, query, options;

  [ err, query ] = getQuery({ args, model: Model.live, role });
  [ err, options ] = getOption({ args, model: Model.live, role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item:any)=>select[item.name.value] = 1);

  if (!options.populate) options.populate = [];
  
  if (select.user_id) {
    options.populate.push({
      path: 'user_id',
      justOne: true
    })
  }

  // 用户隐私信息，仅对管理员可以返回
  if (!role || role != 'admin') {
    query.blocked = false;
    query.ban_date = { '$lt': new Date() }
  }  

  [ err, list ] = await To(Live.find({ query, select: {}, options }));

  list.map((item: any)=>{
    item.audience_count = getAudienceCountByLiveId(item._id);
    item.view_count = getViewCountByLiveId(item._id);
    item.talk_count = getTalkCountByLiveId(item._id);
  });
  
  return list;
}

const countLive = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let err, count: number, query;

  [ err, query ] = getQuery({ args, model: Model.live, role });
  [ err, count ] = await To(Live.count({ query }));

  return {count};

}

const addLive = async (root: any, args: any, context: any, schema: any) => {
  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  
  if (user.role < 50) throw CreateError({ message: '无权限开通直播功能' });

  let err: any, res: any, fields: any;

  [ err, res ] = await To(Live.find({ query: { user_id: user._id } }));

  if (res && res.length > 0) {
    throw CreateError({ message: 'live已创建过了' });
  }

  [ err, fields ] = getSave({ args, model: Model.addLive, role });

  if (err) throw CreateError({ message: err });

  [ err, res ] = await To(Live.save({
    data: {
      user_id: user._id,
      ...fields
    }
  }));

  return { success: true }
}

const updateLive = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err: any, res: any, update: any, query;

  [ err, query ] = getQuery({ args, model: Model.updateLive, role });
  [ err, update ] = getSave({ args, model: Model.updateLive, role });

  if (err) throw CreateError({ message: err });

  [ err, res ] = await To(Live.findOne({
    query
  }));

  if (user._id != res.user_id) {
    throw CreateError({ message: '无权修改' });
  }

  [ err, res ] = await To(Live.update({
    query,
    update: {
      update_at: new Date(),
      ...update
    }
  }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    });
  }

  return { success: true }

}

export const query = { live, countLive }
export const mutation = { addLive, updateLive }