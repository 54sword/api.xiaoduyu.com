
import { Report, User, Posts, Comment } from '../../../models'

import To from '../../../utils/to'
import CreateError from '../../common/errors';
import reportList from '../../../../config/report'

import * as Model from './arguments'
import { getQuery, getOption, getSave } from '../tools'

const reports = async (root: any, args: any, context: any, schema: any) => {
  
  const { user, role } = context
  const { method } = args

  let select: any = {}, err, postList: any, query, options;

  [ err, query ] = getQuery({ args, model: Model.reports, role });
  [ err, options ] = getOption({ args, model: Model.reports, role });

  // console.log(query);
  // console.log(options);

  // 用户隐私信息，仅对管理员可以返回
  if (role != 'admin') {
    throw CreateError({ message: '请求被拒绝' })
  }

  options.populate = [
    { path: 'user_id' },
    { path: 'comment_id' },
    { path: 'posts_id' },
    { path: 'people_id' }
  ];

  [ err, postList ] = await To(Report.find({ query, select, options }));

  options = [
    {
      path: 'comment_id.user_id',
      model: 'User',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 },
      justOne: true
    },
    {
      path: 'posts_id.user_id',
      model: 'User',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 },
      justOne: true
    }
  ];

  [ err, postList ] = await To(Posts.populate({ collections: postList, options }));

  return postList
}

const countReports = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context
  const { method } = args

  let select: any = {}, err, postList: any, query, options, count: number;

  [ err, query ] = getQuery({ args, model: Model.reports, role });
  [ err, options ] = getOption({ args, model: Model.reports, role });


  // console.log(query);
  // console.log(options);

  // 用户隐私信息，仅对管理员可以返回
  if (role != 'admin') {
    throw CreateError({ message: '请求被拒绝' })
  }

  // [ err, postList ] = await To(Report.count({ query }));
  [ err, count ] = await To(Report.count({ query }));

  return count
}

const fetchReportTypes = async (root: any, args: any, context: any, schema: any) => {
  return {
    success: true,
    data: reportList
  }
}

const addReport = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, res, fields: any;

  [ err, fields ] = getSave({ args, model: Model.addReport, role });

  if (err) throw CreateError({ message: err });

  if (!Reflect.has(fields, 'report_id')) {
    if (err) throw CreateError({ message: '缺少参数' });
  }

  let data: any = {}

  if (Reflect.has(fields, 'posts_id')) {
    [ err, res ] = await To(Posts.findOne({
      query: { _id: fields.posts_id }
    }));
    data.posts_id = fields.posts_id;

  } else if (Reflect.has(fields, 'people_id')) {
    [ err, res ] = await To(User.findOne({
      query: { _id: fields.people_id }
    }));
    data.people_id = fields.people_id;

  } else if (Reflect.has(fields, 'comment_id')) {
    [ err, res ] = await To(Comment.findOne({
      query: { _id: fields.comment_id }
    }));
    data.comment_id = fields.comment_id;

  }

  if (Reflect.ownKeys(fields).length == 0) {
    if (err) throw CreateError({ message: '缺少目标参数' });
  }

  let query: any = {
    user_id: user._id,
    // 三天内不能重复提交
    create_at:  { '$lt': new Date().getTime(), '$gt': new Date().getTime() - 1000*60*60*24*3 }
  }

  if (data.posts_id) query.posts_id = data.posts_id;
  if (data.people_id) query.people_id = data.people_id;
  if (data.comment_id) query.comment_id = data.comment_id;

  [ err, res ] = await To(Report.findOne({ query }));

  if (res) {
    throw CreateError({ message: '你已经举报过了' });
  }

  data.user_id = user._id;
  data.report_id = fields.report_id;

  if (fields.detail) data.detail = fields.detail;

  [ err, res ] = await To(Report.save({ data }));

  return { success: true }
}

export const query = { reports, fetchReportTypes, countReports }
export const mutation = { addReport }

