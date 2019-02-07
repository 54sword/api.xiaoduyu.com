
import { Block, Comment, Posts, User } from '../../../models'

import To from '../../../utils/to'
import CreateError from '../../common/errors'

import * as Model from './arguments'
import { getQuery, getSave, getOption } from '../tools'

const blocks = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err: any, res: any, query: any = {}, select: any = {}, options: any = {};
  
  [ err, query ] = getQuery({ args, model: Model.blocks, role });
  [ err, options ] = getOption({ args, model: Model.blocks, role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map((item:any)=>select[item.name.value] = 1);

  if (err) throw CreateError({ message: err });

  query.user_id = user._id;
  if (!query.deleted) query.deleted = false;

  // 添加默认排序
  if (!Reflect.has(options, 'sort_by')) {
    options.sort = {
      create_at: -1
    }
  }

  if (Reflect.has(select, 'people_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'people_id',
      select: { _id: 1, nickname: 1, avatar: 1, create_at: 1 },
      justOne: true 
    });
  }

  if (Reflect.has(select, 'posts_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'posts_id',
      select: { _id: 1, title: 1, content_html: 1, type: 1 },
      justOne: true 
    });
  }

  if (Reflect.has(select, 'comment_id')) {
    if (!options.populate) options.populate = [];
    options.populate.push({
      path: 'comment_id',
      select: { _id: 1, content_html: 1,  posts_id: 1, reply_id: 1, parent_id: 1 },
      justOne: true 
    });
  }

  [ err, res ] = await To(Block.find({ query, select, options }));

  return res
};

// 获取累计数
const countBlocks = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context;

  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err: any, res: any, query: any, count: any;

  [ err, query ] = getQuery({ args, model:Model.blocks, role });

  query.user_id = user._id;
  if (!query.deleted) query.deleted = true;

  if (err) throw CreateError({ message: err });

  [ err, count ] = await To(Block.count({ query }));

  return {
    count
  }

}

const addBlock = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到您的ip' });

  let err: any, res: any, fields: any;

  [ err, fields ] = getSave({ args, model: Model.addBlock, role });

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

  let query: any = { user_id: user._id }
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

  if (res && res.deleted == false) {
    throw CreateError({
      message: '你已屏蔽了'
    });
  }

  //======= 添加

  if (!res) {

    [ err, res ] = await To(Block.save({ data: query }));

    if (err) {
      throw CreateError({
        message: '添加失败',
        data: { errorInfo: err.message }
      });
    }

  } else if (res && res.deleted) {
    await To(Block.update({
      query: { _id: res._id },
      update: { deleted: false }
    }));
  }

  updateUserBlockData(user._id);

  return {
    success: true,
    _id: res._id
  }
};


const removeBlock = async (root: any, args: any, context: any, schema: any) => {

  const { user, role, ip } = context;

  // 未登陆用户
  if (!user) throw CreateError({ message: '请求被拒绝' });
  if (!ip) throw CreateError({ message: '获取不到你的ip' });

  let err: any, res: any, fields: any, query: any = {}, result: any;


  [ err, query ] = getQuery({ args, model: Model.removeBlock, role });

  // 获取更新内容
  // [ err, query ] = getUpdateQuery({ args, model:'block', role });
  if (err) throw CreateError({ message: err });

  if (Reflect.ownKeys(query).length == 0) {
    throw CreateError({ message: '缺少目标参数' });
  }

  query.user_id = user._id + '';

  // 判断数据是否存在
  [ err, result ] = await To(Block.findOne({ query }));
  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!result) {
    throw CreateError({ message: '不存该数据' });
  }

  // 表示未删除状态
  if (result && result.deleted == false) {
    await Block.update({
      query: { _id: result._id },
      update: { deleted: true }
    })
  }

  updateUserBlockData(user._id);

  return {
    success: true
  }

};

async function updateUserBlockData(userId: string) {

  let [ err, data ] = await To(Block.find({
    query: {
      user_id: userId,
      deleted: false
    },
    select: { posts_id: 1, people_id:1, comment_id:1, _id: 0 }
  }));

  var posts_ids: Array<string> = [],
      people_ids: Array<string> = [],
      comment_ids: Array<string> = [];

  data.map(function(item: any){
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

export const query = { blocks, countBlocks }
export const mutation = { addBlock, removeBlock }