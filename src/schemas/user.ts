
import mongoose from 'mongoose';

import config from '../../config';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
  // 昵称
  nickname: String,
  // 最近一次重置昵称的事件
  nickname_reset_at: { type: Date, default: Date.now },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 最近一次登录
  last_sign_at: { type: Date, default: Date.now },
  // 屏蔽用户
  blocked: { type: Boolean, default: false },
  // 禁言，在该时间前不能发布言论
  banned_to_post: { type: Date },
  // 用户等级
  // 100 后台管理员
  role: { type: Number, default: 0 },
  // 头像
  avatar: { type: String, default: '' },
  // 性别 0女 \ 1男
  gender: { type: Number },
  // 简介,一句话介绍自己，70个字符限制
  brief: { type: String, default: '' },
  // 用户注册来源 0->iPhone, 1->iPad, 2->Android, 3->H5, 4->网站, 5->iOS
  source: { type: Number, default: 0 },
  // 帖子累积
  posts_count: { type: Number, default: 0 },
  // 评论累计
  comment_count: { type: Number, default: 0 },
  // 粉丝累计
  fans_count: { type: Number, default: 0 },
  // 获取赞的累计
  like_count: { type: Number, default: 0 },
  // 用户关注的人
  follow_people: [{ type: ObjectId, ref: 'User' }],
  follow_people_count: { type: Number, default: 0 },

  // 用户关注的节点
  follow_topic: [{ type: ObjectId, ref: 'Topic' }],
  follow_topic_count: { type: Number, default: 0 },

  // 关注的话题
  follow_posts: [{ type: ObjectId, ref: 'Posts' }],
  follow_posts_count: { type: Number, default: 0 },

  // 屏蔽的用户
  block_people: [{ type: ObjectId, ref: 'User' }],
  block_people_count: { type: Number, default: 0 },

  // 屏蔽的帖子
  block_posts: [{ type: ObjectId, ref: 'Posts' }],
  block_posts_count: { type: Number, default: 0 },

  // 屏蔽的评论
  block_comment: [{ type: ObjectId, ref: 'Comment' }],
  block_comment_count: { type: Number, default: 0 },

  // 最近一次查询Notification的日期
  find_notification_at: { type: Date },
  
  // 记录最早未一条读消息的日期
  unread_message_at: { type: Date },

  // 最后一次查询帖子的日期
  last_find_posts_at: { type: Date },

  // 最近一次查询自己关注的feed的日期，用于有新的feed，与它比较是否有新的feed，显示小红点
  last_find_feed_at: { type: Date },

  // 最近一次查询自己订阅帖子的日期
  last_find_subscribe_at: { type: Date },

  // 最近一次查询优选帖子的日期
  last_find_excellent_at: { type: Date },

  // 访问令牌
  access_token: { type: String },
  // 密码
  password: String,
  // 主题(1亮色，2暗色)
  theme: { type: Number, default: 0 }
});

UserSchema.virtual('avatar_url').get(function (this: any) {
  let url = this.avatar ? this.avatar : config.defaultAvatar;
  url += url.indexOf('thumbnail') != -1 ? '/quality/90' : '';
  return url;
});


UserSchema.set('toJSON', { getters: true });

mongoose.model('User', UserSchema);
