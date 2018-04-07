import { User, Account, Oauth, Phone } from '../../modelsa'
//
// let query = {}
// let mutation = {}
// let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
// import Querys from '../querys'
// import Updates from '../updates'

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];

function changeString(str) {
  var length = str.length
  var s = ''

  if (length == 1) {
    return '*'
  } else if (length == 2) {
    return str.substring(0,1)+'*'
  } else if (length <= 5) {
    var l = 1
  } else {
    var l = 2
  }

  var _str = str.substring(l,length-l)
  var _s = ''
  for (var i = 0, max = _str.length; i < max; i++) {
    _s += '*'
  }
  return str.replace(_str,_s);

}

query.selfInfo = async (root, args, context, schema) => {

  let { user } = context

  user = JSON.stringify(user);
  user = JSON.parse(user);

  if (!user) {
    throw CreateError({
      message: '无效获取',
      data: {}
    })
  }

  let err, result;

  [ err, result ] = await To(Account.findOne({
    query: { user_id: user._id }
  }))

  if (result) {
    var arr = result.email.split("@");
    var email = changeString(arr[0])+'@'+arr[1];
    user.email = email;
  };

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'weibo'));

  user.weibo = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'qq'));
  user.qq = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'github'));
  user.github = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Phone.findOne({
    query: { user_id: user._id }
  }))

  user.phone = result ? changeString(result.phone + '') : ''

  return user

}

query.users = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}, err, query, options, userList;
  // let { query, options } = Querys({ args, model: 'user', role });


  [ err, query ] = getQuery({ args, model: 'user', role });
  [ err, options ] = getOption({ args, model: 'user', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  //===

  [ err, userList ] = await To(User.find({ query, select, options }));

  return userList
}

query.countUsers = async (root, args, context, schema) => {

  const { user, role } = context
  let err, query, count;
  // let { query } = Querys({ args, model: 'user', role });
  [ err, query ] = getQuery({ args, model: 'user', role });

  //===

  [ err, count ] = await To(User.count({ query }));

  return { count }
}

mutation.updateUser = async (root, args, context, schema) => {

  const { user, role } = context
  let options = {}, err, query, update, result;

  [ err, query ] = getUpdateContent({ args, model: 'user', role });
  [ err, update ] = getUpdateContent({ args, model: 'user', role });

  if (error) {
    throw CreateError({
      message: error,
      data: {}
    })
  }

  if (query._id != user._id + '') {
    throw CreateError({ message: '无权修改' });
  }

  [ err, result ] = await To(User.update({ query, update, options }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
