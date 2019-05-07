import { Message, Session, User} from '../../../models'
import To from '../../../utils/to'
import CreateError from '../../common/errors'
import * as alicloud from '../../../common/alicloud';

import xss from '../../../utils/xss'

import { emit } from '../../../socket'

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'


const messages = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let query, options, err, messageList: any = [];

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, query ] = getQuery({ args, model:Model.messages, role });
  [ err, options ] = getOption({ args, model:Model.messages, role });
  
  options.populate = [
    {
      path: 'user_id',
      justOne: true
    },
    {
      path: 'addressee_id',
      justOne: true
    }
  ];

  [ err, messageList ] = await To(Message.find({ query, options }));

  return messageList
}

const countMessages = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context
  let query, err, count;

  if (!user || !ip) throw CreateError({ message: '请求被拒绝' });

  [ err, query ] = getQuery({ args, model:Model.messages, role });

  [ err, count ] = await To(Message.count({ query }));
  
  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }
  
  if ( Reflect.has(args, 'has_read') && args.has_read === false ) {
    Message.findOne({
      query: {
        user_id: user._id,
        has_read: false
      },
      options: {
        sort:{
          create_at: 1
        }
      }
    }).then((item: any)=>{

      if (!item) return;

      User.updateOne({
        query: {
          _id: user._id
        },
        update: {
          unread_message_at: item.create_at
        }
      });

    });
  }

  return { count }
}


const addMessage = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip  } = context;

  let err, res, fields;

  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '无效的ip地址' });

  [ err, fields ] = getSave({ args, model:Model.addMessage, role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { addressee_id, type, content, content_html, device = 1 } = fields;

  if (user._id+'' == addressee_id) {
    throw CreateError({
      message: '不能给自己发送私信'
    });
  }
  
  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date()+'', user.banned_to_post);
    throw CreateError({
      message: '您被禁言，{days}天{hours}小时{mintues}分钟后解除禁言',
      data: { error_data: countdown }
    });
  }

  content_html = xss(content_html);

  let _content_html = content_html || '';

  _content_html = _content_html.replace(/<[^>]+>/g,"");
  _content_html = _content_html.replace(/(^\s*)|(\s*$)/g, "");

  if (!_content_html) {
    throw CreateError({
      message: '私信内容不能为空'
    });
  }

  [ err, res ] = await To(User.findOne({
    query: {
      _id: addressee_id
    }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!res) {
    throw CreateError({
      message: '发件人不存在'
    });
  }

  [ err, res ] = await To(Message.save({
    data: {
      user_id: user._id,
      addressee_id,
      type,
      content,
      content_html,
      device,
      ip
    }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  // 阿里云推送
  let commentContent = content_html.replace(/<[^>]+>/g,"");
      
  let titleIOS = user.nickname + ': ' + commentContent;
  if (titleIOS.length > 40) titleIOS = titleIOS.slice(0, 40) + '...';
  
  let body = commentContent;
  if (body.length > 40) body = body.slice(0, 40) + '...';

  alicloud.pushToAccount({
    userId: addressee_id,
    title: user.nickname,
    body,
    summary: titleIOS,
    params: {
      routeName: 'Sessions', params: {}
    }
  });


  updateSession(user._id, addressee_id, res._id);
  updateSession(addressee_id, user._id, res._id);

  return {
    success: true,
    _id: res._id
  }
}

const updateSession = async (userId: string, addresseeId: string, messageId: string) => {

  let session, count, message, err;

  // 查询是否存在会话，如果不存在则创建会话
  [ err, session ] = await To(Session.findOne({
    query: {
      user_id: userId,
      addressee_id: addresseeId
    }
  }));

  if (!session) {
    return;
  }

  [ err, count ] = await To(Message.count({
    query: {
      user_id: session.user_id,
      addressee_id: session.addressee_id,
      has_read: false
      // create_at: {
        // '$gte': message.create_at
      // }
    }
  }));

  await Session.updateOne({
    query: {
      _id: session._id
    },
    update: {
      last_message: messageId,
      unread_count: count
    }
  });

  emit(addresseeId, {
    type: 'new-session',
    data: {
      sessionId: session._id,
      messageId
    }
  });

}

export const query = { messages, countMessages }
export const mutation = { addMessage }

function Countdown(nowDate: (string|number), endDate: (string|number)) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)
  var timeCount = lastDate - now
  var days = parseInt( (timeCount / (3600*24))+'' )
  var hours = parseInt( ((timeCount - (3600*24*days)) / 3600)+'' )
  var mintues = parseInt( ((timeCount - (3600*24*days) - (hours*3600)) / 60)+'' )
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}