import { Session, Message } from '../../../models'
import To from '../../../utils/to'
import CreateError from '../../common/errors'

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'


const sessions = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let query, options, err, list: any = [];

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, query ] = getQuery({ args, model:Model.sessions, role });
  [ err, options ] = getOption({ args, model:Model.sessions, role });

  if (query._id) {
  } else {
    query.addressee_id = user._id;
    query.last_message = { '$exists': true };
  }
  
  options.populate = [
    {
      path: 'user_id',
      justOne: true
    },
    {
      path: 'addressee_id',
      justOne: true
    },
    {
      path: 'last_message',
      justOne: true
    }
  ];

  [ err, list ] = await To(Session.find({ query, options }));

  if (query._id && list[0] && list[0].addressee_id._id + '' != user._id + '') {
    throw CreateError({ message: '请求被拒绝' }); 
  }

  return list
}


const countSessions = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let query, options, err, count = 0;

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, query ] = getQuery({ args, model:Model.sessions, role });
  [ err, options ] = getOption({ args, model:Model.sessions, role });

  [ err, count ] = await To(Session.count({ query, options }));

  return { count }
}

const getUnreadSessions = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  let [ err, list ] = await To(Session.find({
    query: {
      addressee_id: user._id,
      unread_count: { '$gt': 0 }
    }
  }));

  let count = 0;

  list.map((item: any)=>{
    count += item.unread_count;
  });

  return { count }
}


const createSession = (userId: string, addresseeId: string ) => {
  return new Promise(async (resove, reject)=>{

    let err, session;

    // 查询是否存在会话，如果不存在则创建会话
    [ err, session ] = await To(Session.findOne({
      query: {
        user_id: userId,
        addressee_id: addresseeId
      }
    }));
    
    if (!session) {
      [ err, session ] = await To(Session.save({
        data: {
          user_id: userId,
          addressee_id: addresseeId
        }
      }));
    }

    if (err) {
      reject(err);
    } else {
      resove(session);
    }

  })
}

const getSession = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let save, err, session;

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, save ] = getSave({ args, model:Model.getSession, role });

  const { addressee_id } = save;
  
  await To(createSession(user._id, addressee_id));
  
  [ err, session ] = await To(createSession(addressee_id, user._id));

  return session
}


// session 设置已读
const readSession = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let query, err, session;

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, query ] = getQuery({ args, model:Model.readSession, role });

  // 查询是否存在会话，如果不存在则创建会话
  [ err, session ] = await To(Session.findOne({
    query
  }));

  if (session.addressee_id +'' == user._id + '') {

    // 更新会话未读条数为0
    await To(Session.updateOne({
      query,
      update: {
        unread_count: 0
      }
    }));

    // 查询这个会话中未读的消息，并更新为已读
    Message.find({
      query: {
        addressee_id: session.addressee_id,
        user_id: session.user_id,
        has_read: false,
        blocked: false,
        deleted: false
      }
    }).then((res: any)=>{

      if (res) {
        res.map((item: any)=>{
          Message.update({
            query: { _id: item._id },
            update: { has_read: true }
          });
        });
      }

      console.log(res);
    });
      
    return {
      success: true
    }
  } else {
    return {
      success: false
    }
  }

}

export const query = { sessions, countSessions, getSession, getUnreadSessions }
export const mutation = { readSession }