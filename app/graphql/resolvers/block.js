
import { Block, Comment, Posts, User } from '../../modelsa';

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
import To from '../../common/to';
import CreateError from './errors';

let [query, mutation, resolvers] = [{}, {}, {}];

query.blocks = async (root, args, context, schema) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err, res, query = {}, select = {}, options = {};
  [ err, query ] = getQuery({ args, model: 'block', role });
  [ err, options ] = getOption({ args, model:'block', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1);

  if (err) throw CreateError({ message: err });

  query.user_id = user._id;

  if (Reflect.has(select, 'people_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'people_id',
      select: { _id: 1, nickname: 1, avatar: 1, create_at: 1 }
    });
  }

  if (Reflect.has(select, 'posts_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'posts_id',
      select: { _id: 1, title: 1, content_html: 1, type: 1 }
    });
  }

  if (Reflect.has(select, 'comment_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'comment_id',
      select: { _id: 1, content_html: 1,  posts_id: 1, reply_id: 1, parent_id: 1 }
    });
  }

  [ err, res ] = await To(Block.find({ query, select, options }));

  return res
};

// 获取累计数
query.countBlocks = async (root, args, context, schema) => {

  const { user, role, ip } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err, res, query, count;

  [ err, query ] = getQuery({ args, model: 'block', role });

  query.user_id = user._id;

  if (err) throw CreateError({ message: err });

  [ err, count ] = await To(Block.count({ query }));

  return {
    count
  }

}

mutation.addBlock = async (root, args, context, schema) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err, res, fields;
  [ err, fields ] = getSaveFields({ args, model: 'block', role });

  if (err) throw CreateError({ message: err });

  //======= 开始逻辑

  let { posts_id, comment_id, people_id } = fields;

  if (posts_id) {

    [ err, res ] = await To(Posts.findOne({
      query: { _id: posts_id }
    }));

    if (err) {
      throw CreateError({
        message: '帖子查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (!res) throw CreateError({ message: '帖子不存在' });

    if (res.user_id + '' === user._id + '') {
      throw CreateError({
        message: '不能屏蔽自己的帖子'
      });
    }

  } else if (comment_id) {

    [ err, res ] = await To(Comment.findOne({
      query: { _id: comment_id }
    }));

    if (err) {
      throw CreateError({
        message: '评论查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (!res) throw CreateError({ message: '评论不存在' });

    if (res.user_id + '' === user._id + '') {
      throw CreateError({
        message: '不能屏蔽自己的评论'
      });
    }

  } else if (people_id) {

    [ err, res ] = await To(User.findOne({
      query: { _id: people_id }
    }));

    if (err) {
      throw CreateError({
        message: '用户查询失败',
        data: { errorInfo: err.message }
      });
    }

    if (!res) throw CreateError({ message: '用户不存在' });

    if (res._id + '' === user._id + '') {
      throw CreateError({
        message: '不能屏蔽自己'
      });
    }

  } else {
    throw CreateError({
      message: '缺少目标id',
      data: { errorInfo: err.message }
    });
  }

  //======= 查询是否屏蔽该资源

  let query = { user_id: user._id, ip }
  if (comment_id) query.comment_id = comment_id;
  else if (people_id) query.people_id = people_id;
  else if (posts_id) query.posts_id = posts_id;

  [ err, res ] = await To(Block.findOne({ query }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (res) {
    throw CreateError({
      message: '你已屏蔽了'
    });
  }

  //======= 添加

  [ err, res ] = await To(Block.save({ data: query }));

  if (err) {
    throw CreateError({
      message: '添加失败',
      data: { errorInfo: err.message }
    });
  }

  updateUserBlockData(user._id);

  return { success: true }
};
mutation.removeBlock = () => ({ success: true });


async function updateUserBlockData(userId) {

  let [ err, data ] = await To(Block.find({
    query: {
      user_id: userId,
      deleted: false
    },
    select: { posts_id: 1, people_id:1, comment_id:1, _id: 0 }
  }));

  var posts_ids = [], people_ids = [], comment_ids = [];

  data.map(function(item){
    if (item.posts_id) posts_ids.push(item.posts_id);
    if (item.people_id) people_ids.push(item.people_id);
    if (item.comment_id) comment_ids.push(item.comment_id);
  });

  User.update({
    query: { _id: userId },
    update: {
      block_posts: posts_ids,
      block_posts_count: posts_ids.length,
      block_comment: comment_ids,
      block_comment_count: comment_ids.length,
      block_people: people_ids,
      block_people_count: people_ids.length
    }
  });

}



exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
