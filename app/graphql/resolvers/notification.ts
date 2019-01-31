import { Notification } from '../../models';

import To from '../../common/to';
import CreateError from '../common/errors';

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];

query.notifications = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let err, select = {}, query, options, list;

  [ err, query ] = getQuery({ args, model:'notification', role });
  [ err, options ] = getOption({ args, model:'notification', role });



  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

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

query.countNotifications = async (root, args, context, schema) => {

  const { user, role } = context;

  let err, query, count;

  [ err, query ] = getQuery({ args, model:'notification', role });
  [ err, count ] = await To(Notification.count({ query }))

  return {
    count
  }
}

mutation.updateNotifaction = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let options = {}, err, query, update, result;

  [ err, query ] = getUpdateQuery({ args, model:'notification', role });
  [ err, update ] = getUpdateContent({ args, model:'notification', role });

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

export { query, mutation, resolvers }
