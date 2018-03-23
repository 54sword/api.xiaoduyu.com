
import { Follow, Topic, User, Posts, UserNotification } from '../../modelsa';
import { domain } from '../../../config';

let query = {};
let mutation = {};
let resolvers = {};

import To from '../../common/to';
import CreateError from './errors';

import { getSaveFields } from '../config';


// 还缺少通知
mutation.addFollow = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, // 错误
      result, // 结果
      fields, // 字段
      posts_user_id; // 关注帖子的创建用户

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSaveFields({ args, model:'follow', role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  const { topic_id, posts_id, user_id, status } = fields;

  if (!Reflect.has(fields, 'status')) {
    throw CreateError({ message: 'status 不能为空' });
  } else if (topic_id && posts_id ||
    posts_id && user_id ||
    user_id && topic_id
  ) {
    throw CreateError({ message: '不能同时传多个目标id' });
  }

  // 如果存在话题，判断话题是否存在
  if (topic_id) {

    [ err, result ] = await To(Topic.findOne({
      query: { _id: topic_id },
      select: { _id: 1 }
    }));

    if (err || !result) {
      throw CreateError({
        message: err ? '查询失败' : '话题不存在',
        data: { errorInfo: err ? err.message : '' }
      })
    }

  }

  // 如果存在用户，判断话题是否存在
  if (user_id) {

    [ err, result ] = await To(User.findOne({
      query: { _id: user_id },
      select: { _id: 1 }
    }));

    if (err || !result) {
      throw CreateError({
        message: err ? '查询失败' : '用户不存在',
        data: { errorInfo: err ? err.message : '' }
      })
    }

  }

  // 如果存在用户，判断话题是否存在
  if (posts_id) {

    [ err, result ] = await To(Posts.findOne({
      query: { _id: posts_id },
      select: { _id: 1, user_id: 1 }
    }));

    if (err || !result) {
      throw CreateError({
        message: err ? '查询失败' : '帖子不存在',
        data: { errorInfo: err ? err.message : '' }
      })
    } else {
      posts_user_id = result.user_id;
    }

  }

  let query = {
    user_id: user._id
  }

  if (topic_id) query.topic_id = topic_id;
  else if (posts_id) query.posts_id = posts_id;
  else if (user_id) query.user_id = user_id;

  [ err, result ] = await To(Follow.findOne({
    query: query
  }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  // 关注
  if (status) {

    // 添加关注
    if (!result) {
      // 添加
      [ err, result ] = await To(Follow.save({ data: query }));

      if (err) {
        throw CreateError({
          message: '储存失败',
          data: { errorInfo: err.message }
        })
      }

    } else {
      // 修改
      [ err, result ] = await To(Follow.update({
        query: { _id: result._id },
        update: { deleted: false }
      }));

      if (err) {
        throw CreateError({
          message: '更新失败',
          data: { errorInfo: err.message }
        })
      }

    }

  } else {

    // 取消关注
    if (result) {

      // 修改
      [ err, result ] = await To(Follow.update({
        query: { _id: result._id },
        update: { deleted: true }
      }));

      if (err) {
        throw CreateError({
          message: '更新失败',
          data: { errorInfo: err.message }
        })
      }

    }

  }

  // 更新相关count
  if (topic_id) {
    await updateTopicFollowCount(topic_id);
    await updateUserTopicCount(user._id);
  } else if (posts_id) {
    await updateUserPostsCount(user._id);
    await updatePostsFollowCount(posts_id);
  } else if (user_id) {
    await updatePeopleFollowCount(user_id);
    await updateUserFollowPeopleCount(user._id);
  }

  // 发送通知
  if (posts_id || user_id) {

    let data = {};

    if (posts_id) {
      data = {
        type: 'follow-posts',
        posts_id: posts_id,
        sender_id: user._id,
        addressee_id: posts_user_id
      }
    } else if (user_id) {
      data = {
        type: 'follow-you',
        sender_id: user._id,
        addressee_id: user_id
      }
    }
    
    [ err, result ] = await To(UserNotification.findOne({ query: data }));

    if (!result && status) {
      // 不存在则创建一条通知
      await To(UserNotification.save({ data }));
    } else if (result && !status) {
      // 如果存在，并且是取消关注，则标记通知为删除
      await To(UserNotification.update({
        query: { _id: result._id },
        update: { deleted: true }
      }));
    } else if (result && result.deleted && status) {
      // 如果存在，并且通知是删除状态，并且是关注操作，则取消删除标记
      await To(UserNotification.update({
        query: { _id: result._id },
        update: { deleted: false }
      }));
    }

  }

  return {
    success: true
  }
}

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;


async function updateUserPostsCount(userId) {

  let [ err, result ] = await To(Follow.find({
    query: {
      user_id: userId,
      posts_id: { $exists: true },
      deleted: false
    },
    select: { posts_id: 1, _id: 0 }
  }));

  var ids = [];
  result.map(item =>{ ids.push(item.posts_id) });

  [ err, result ] = await To(User.update({
    query: { _id: userId },
    update: { follow_posts: ids, follow_posts_count: ids.length }
  }));

};

async function updateUserTopicCount(userId) {

  let [ err, result ] = await To(Follow.find({
    query: {
      user_id: userId,
      topic_id: { $exists: true },
      deleted: false
    },
    select: { topic_id: 1, _id: 0 }
  }));

  var ids = [];
  result.map(item =>{ ids.push(item.posts_id) });

  [ err, result ] = await To(User.update({
    query: { _id: userId },
    update: { follow_topic: ids, follow_topic_count: ids.length }
  }));

};


async function updateUserFollowPeopleCount(userId) {

  let [ err, result ] = await To(Follow.find({
    query: {
      user_id: userId,
      people_id: { $exists: true },
      deleted: false
    },
    select: { people_id: 1, _id: 0 }
  }));

  var ids = [];
  result.map(item =>{ ids.push(item.posts_id) });

  [ err, result ] = await To(User.update({
    query: { _id: userId },
    update: { follow_people: ids, follow_people_count: ids.length }
  }));

};


async function updatePostsFollowCount(postsId) {

  let [ err, total ] = await To(Follow.count({
    query: { posts_id: postsId, deleted: false }
  }));

  await To(Posts.update({
    query: { _id: postsId },
    update: { follow_count: total }
  }));

};


// 更新节点被关注的数量
async function updateTopicFollowCount(topicId) {

  let [ err, total ] = await To(Follow.count({
    query: { topic_id: topicId, deleted: false }
  }));

  await To(Topic.update({
    query: { _id: topicId },
    update: { follow_count: total }
  }));

};

async function updatePeopleFollowCount(peopleId) {

  let [ err, total ] = await To(Follow.count({
    query: { people_id: peopleId, deleted: false }
  }));

  await To(User.update({
    query: { _id: peopleId },
    update: { fans_count: total }
  }));

};
