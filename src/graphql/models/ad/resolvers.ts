/*
import { User, AD } from '../../../models'

import To from '../../../utils/to'
import CreateError from '../../common/errors';
import reportList from '../../../../config/report'

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'

const ads = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let select: any = {}, err, list: any, query, options;

  [ err, query ] = getQuery({ args, model: Model.ads, role });
  [ err, options ] = getOption({ args, model: Model.ads, role });

  [ err, list ] = await To(AD.find({ query, select, options }));

  return list;
}

const countAds = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let err, count: number, query;

  [ err, query ] = getQuery({ args, model: Model.ads, role });
  [ err, count ] = await To(AD.count({ query }));

  return {count};

}

const addAD = async (root: any, args: any, context: any, schema: any) => {
  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  if (user.ad) {
    throw CreateError({ message: '已经创建过了' });
  }

  let err: any, res: any, fields: any;

  [ err, fields ] = getSave({ args, model: Model.addAD, role });

  if (err) throw CreateError({ message: err });

  [ err, res ] = await To(AD.save({
    data: {
      user_id: user._id,
      ...fields
    }
  }));

  if (res && res._id) {
    await To(User.update({
      query: { _id: user._id },
      update: { ad: res._id }
    }))
  }

  return { success: true }
}

const updateAD = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  if (!user.ad) {
    throw CreateError({ message: '更新失败，还未创建广告' });
  }

  let err: any, res: any, update: any, query;

  [ err, query ] = getQuery({ args, model: Model.updateAD, role });
  [ err, update ] = getSave({ args, model: Model.updateAD, role });

  if (err) throw CreateError({ message: err });

  [ err, res ] = await To(AD.findOne({
    query
  }));

  if (user._id != res.user_id && role != 'admin') {
    throw CreateError({ message: '无权修改' });
  }

  [ err, res ] = await To(AD.update({
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

export const query = { ads, countAds }
export const mutation = { addAD, updateAD }

*/