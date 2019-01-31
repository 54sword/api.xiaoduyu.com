
import { Report, Phone, User, Captcha, Posts, Comment } from '../../models';

// tools
// import Countries from '../../data/countries';

import To from '../../common/to'
import CreateError from '../common/errors';

// graphql
import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
let [ query, mutation, resolvers ] = [{},{},{}];


query.fetchReportTypes = async (root, args, context, schema) => {

  let data = [
    { id: 1, text: '垃圾营销' },
    { id: 2, text: '淫秽色情' },
    { id: 3, text: '不实信息' },
    { id: 4, text: '人身攻击我' },
    { id: 5, text: '有害信息' },
    { id: 6, text: '抄袭我的内容' },
    { id: 7, text: '违法信息' }
  ];

  return {
    success: true,
    data
  }
}


mutation.addReport = async (root, args, context, schema) => {

  const { user, role } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let err, res, fields;

  [ err, fields ] = getSaveFields({ args, model:'report', role });

  if (err) throw CreateError({ message: err });

  if (!Reflect.has(fields, 'report_id')) {
    if (err) throw CreateError({ message: '缺少参数' });
  }

  let data = {}

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

  let query = {
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



export { query, mutation, resolvers }
