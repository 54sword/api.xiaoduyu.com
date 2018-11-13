import { User, Account, Oauth, Phone, Captcha, Follow, Feed } from '../../modelsa';

import xss from 'xss';
import uuid from 'node-uuid';

import Countries from '../../data/countries';
import Validate from '../../common/validate';

import To from '../../common/to';
import CreateError from './errors';

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

// 获取用户自己的个人资料
query.selfInfo = async (root, args, context, schema) => {

  let { user } = context;

  if (!user) {
    throw CreateError({
      message: '没有权限访问',
      data: { }
    });
  }

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
  }));

  if (result) {
    var arr = result.email.split("@");
    var email = changeString(arr[0])+'@'+arr[1];
    user.email = email;
  } else {
    user.email = '';
  }

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'weibo'));
  user.weibo = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'qq'));
  user.qq = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Oauth.fetchByUserIdAndSource(user._id, 'github'));
  user.github = result && result.deleted == false ? true : false;

  [ err, result ] = await To(Phone.findOne({ query: { user_id: user._id } }));
  user.phone = result ? changeString(result.phone + '') : '';
  user.area_code = result ? result.area_code : '';

  user.has_password = user.password ? true : false;
  
  return user;

}

query.users = async (root, args, context, schema) => {

  const { user, role } = context;
  const { method } = args;
  let select = {}, err, query, options, list, ids, res;

  [ err, query ] = getQuery({ args, model: 'user', role });
  [ err, options ] = getOption({ args, model: 'user', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  //===

  [ err, list ] = await To(User.find({ query, select, options }));

  list = JSON.parse(JSON.stringify(list));

  if (user) {

    if (Reflect.has(select, 'follow')) {

      ids = [];

      list.map(item=>ids.push(item._id));

      [ err, res ] = await To(Follow.find({
        query: {
          user_id: user._id,
          people_id: { "$in": ids },
          deleted: false
        }
      }));

      ids = {};

      res.map(item=>ids[item.people_id] = 1);

      list.map(item => {
        item.follow = ids[item._id] ? true : false;
        return item;
      });

    }

  }

  return list
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


// 注册用户
mutation.addUser = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, res, fields;

  [ err, fields ] = getSaveFields({ args, model: 'user', role });

  let { nickname, email, area_code, phone, password, source, captcha, gender } = fields;


  if (!email && !phone) {
    throw CreateError({ message: '手机或邮箱，两个必填一个' });
  }

  if (!captcha) {
    throw CreateError({ message: '验证码不能为空' });
  }

  if (typeof gender != 'undefined') {
    if (gender != 0 && gender != 1) {
      throw CreateError({ message: '无效的性别值' });
    }
  }

  if (phone) {

    let areaCodeStatus = false;

    Countries.map(item=>{
      if (item.code == area_code) areaCodeStatus = true;
    })

    if (!areaCodeStatus) {
      throw CreateError({ message: '手机区号不存在' });
    }
  }

  // xss过滤
  nickname = xss(nickname, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: function (tag, name, value, isWhiteAttr) { return ''; }
  });

  if (Validate.nickname(nickname) != 'ok') {
    throw CreateError({ message: '名字长度不能为空，或大于了20个字符' });
  }

  if (Validate.password(password) != 'ok') {
    throw CreateError({ message: '密码长度需6-30个字符范围' });
  }

  if (email) {

    [ err, res ] = await To(Account.findOne({
      query: { email }
    }));

    if (err) {
      throw CreateError({
        message: '添加失败',
        data: { errorInfo: err.message }
      });
    }

  }

  // 判断邮箱是否已经被注册
  if (email) {

    [ err, res ] = await To(Account.findOne({
      query: { email }
    }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (res) {
      throw CreateError({ message: '邮箱已经被注册' });
    }

  }

  // 判断手机号是否已经被注册
  if (phone) {

    [ err, res ] = await To(Phone.findOne({
      query: { phone }
    }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (res) {
      throw CreateError({ message: '手机已经被注册' });
    }

  }

  // 判断验证码是否有效
  [ err, res ] = await To(Captcha.findOne({
    query: phone ? { phone } : { email },
    options: { sort:{ create_at: -1 } }
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!res) {
    throw CreateError({ message: '验证码不存在' });
  }

  if (res.captcha != captcha) {
    throw CreateError({ message: '验证码错误' });
  }

  // 获取加密的 hash 密码
  [ err, password ] = await To(User.generateHashPassword({ password }));

  let data = {
    nickname,
    password,
    source: source || 0,
    access_token: uuid.v4()
  }

  if (typeof gender != 'undefined') {
    data.gender = gender;
  }

  [ err, res ] = await To(User.save({ data }));

  if (err) {
    throw CreateError({
      message: '创建用户失败',
      data: { errorInfo: err.message }
    });
  }

  if (email) {
    [ err, res ] = await To(Account.save({
      data: { email, user_id: res._id }
    }));

    if (err) {
      throw CreateError({
        message: '创建邮箱账户失败',
        data: { errorInfo: err.message }
      });
    }

  }

  if (phone) {
    [ err, res ] = await To(Phone.save({
      data: { phone, user_id: res._id, area_code }
    }));

    if (err) {
      throw CreateError({
        message: '创建手机账户失败',
        data: { errorInfo: err.message }
      });
    }

  }

  await To(Captcha.remove({
    query: phone ? { phone } : { email }
  }));

  return {
    success: true
  }
}

mutation.updateUser = async (root, args, context, schema) => {

  const { user, role } = context;
  let options = {}, err, query, update, result;

  [ err, query ] = getUpdateQuery({ args, model: 'user', role });
  [ err, update ] = getUpdateContent({ args, model: 'user', role });

  if (err) {
    throw CreateError({
      message: err
    })
  }

  if (role != 'admin') {
    if (query._id != user._id + '') {
      throw CreateError({ message: '无权修改' });
    }
  }

  if (Reflect.has(update, 'nickname')) {
    if (!update.nickname) {
      throw CreateError({ message: '昵称不能为空' });
    } else if (update.nickname.length > 12) {
      throw CreateError({ message: '字符长度不能大于16个字符' });
    }
  }

  [ err, result ] = await To(User.update({ query, update, options }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    })
  }

  if (Reflect.has(update, 'blocked')) {

    // 更新feed中相关posts的delete状态
    let err, feedList;

    [ err, feedList ] = await To(Feed.find({
      query: { user_id: query._id }
    }));

    let ids = [];

    feedList.map(feed=>ids.push(feed._id));

    [ err ] = await To(Feed.update({
      query: { _id: { '$in': ids } },
      update: { deleted: update.blocked },
      options: { multi: true }
    }));

    if (err) {
      throw CreateError({
        message: 'Feed 更新失败',
        data: { errorInfo: err.message }
      });
    }

  }

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
