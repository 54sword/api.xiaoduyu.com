import { Notification } from '../../../models';

import To from '../../../utils/to';
import CreateError from '../../common/errors';

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'


const notifications = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args
  let err, select: any = {}, query, options, list;

  [ err, query ] = getQuery({ args, model: Model.notifications, role });
  [ err, options ] = getOption({ args, model: Model.notifications, role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item:any)=>select[item.name.value] = 1)

  //===

  options.populate = [
    {
      path: 'sender_id',
      select: {
        '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1
      }
    }
  ];
  
  [ err, list ] = await To(Notification.find({ query, select, options }));

  return list
}

const countNotifications = async (root: any, args: any, context: any, schema: any) => {

  const { role } = context;
  
  let err, query, count;

  [ err, query ] = getQuery({ args, model: Model.notifications, role });

  [ err, count ] = await To(Notification.count({ query }))

  return {
    count
  }
}

const updateNotifaction = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args
  let options = {}, err, query, update, result;

  [ err, query ] = getQuery({ args, model: Model.updateNotifaction, role });
  [ err, update ] = getSave({ args, model: Model.updateNotifaction, role });

  if (err) {
    throw CreateError({
      message: err,
      data: {}
    })
  }

  [ err, result ] = await To(Notification.update({ query, update, options }))

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}

export const query = { notifications, countNotifications }
export const mutation = { updateNotifaction }
