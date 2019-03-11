
import { Posts, UserNotification, Comment, Like } from '../../../models';

import To from '../../../utils/to';
import CreateError from '../../common/errors';

import * as aModel from './arguments'
import { getSave } from '../tools'

// 还缺少通知
const like = async (root: any, args: any, context: any, schema: any) => {

  const { user, role } = context;
  let err, // 错误
      result, // 结果
      fields, // 字段
      Model, // 目标操作的方法
      target; // 目标对象

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSave({ args, model: aModel.like, role });

  if (err) throw CreateError({ message: err });

  // ===================================
  // 业务主逻辑

  const { type, target_id, mood, status } = fields;

  if (type == 'comment' || type == 'reply') {
    Model = Comment;
  } else if (type == 'posts') {
    Model = Posts;
  } else {
    throw CreateError({ message: 'type 类型错误' });
  }

  [ err, target ] = await To(Model.findOne({
    query: { _id: target_id }
  }));

  if (err) {
    throw CreateError({
      message: 'target_id 查询失败',
      data: { errorInfo: err.message }
    })
  } else if (!target) {
    throw CreateError({
      message: '查询不到 target_id 资源'
    })
  }

  if (target.user_id + '' == user._id + '') {
    throw CreateError({ message: '不能点赞自己的帖子或评论' });
  }

  [ err, result ] = await To(Like.findOne({
    query: {
      user_id: user._id, type, target_id
    }
  }));

  if (!result && status) {

    // 添加赞

    [ err, result ] = await To(Like.save({
      data: {
        user_id: user._id,
        type,
        target_id,
        mood
      }
    }));

  } else if (result && result.deleted == true && status) {

    // 恢复赞

    [ err, result ] = await To(Like.update({
      query: { _id: result._id },
      update: { deleted: false }
    }));

  } else if (result && result.deleted == false && !status) {

    // 取消赞

    [ err, result ] = await To(Like.update({
      query: { _id: result._id },
      update: { deleted: true }
    }));

  }

  // ===================================
  // 更新累计数

  [ err, result ] = await To(Like.count({
    query: { target_id, deleted: false }
  }));

  await To(Model.update({
    query: { _id: target_id },
    update: { like_count: result }
  }));

  // ===================================
  // 发送通知

  let data: any = {
    sender_id: user._id,
    addressee_id: target.user_id,
  }

  if (type == 'comment') {
    data.type = 'like-comment'
    data.comment_id = target_id
  } else if (type == 'reply') {
    data.type = 'like-reply'
    data.comment_id = target_id
  } else if (type == 'posts') {
    data.type = 'like-posts'
    data.posts_id = target_id
  }

  [ err, result ] = await To(UserNotification.findOne({ query: data }));

  if (result) {

    if (result.deleted && status ||
      !result.deleted && !status
    ) {
      await To(UserNotification.update({
        query: { _id: result._id },
        update: { deleted: status ? false : true }
      }));
    }

  } else if (!result && status) {
    // 添加通知
    await To(UserNotification.addOneAndSendNotification({ data }));
  }

  // 返回
  return {
    success: true
  }
}

export const query = { }
export const mutation = { like }
