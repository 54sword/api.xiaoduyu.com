
// var config = require('../../configs/config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = new Schema({
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
  // 限制发送消息
  disable_send_reply: { type: Date, default: Date.now },
  // 用户等级
  // 0 新手
  // 1 普通用户
  // 100 后台管理员
  role: { type: Number, default: 0 },

  // 是否上传了头像
  // avatar: { type: Boolean, default: false },
  // 头像
  avatar: { type: String, default: '' },
  // 性别
  gender: { type: Number, default: 0 },
  // 简介,一句话介绍自己，70个字符限制
  brief: { type: String, default: '' },

  // 用户注册来源 0->iPhone, 1->iPad, 2->Android, 3->H5, 4->网站
  source: { type: Number, default: 0 },

  // 帖子累积
  posts_count: { type: Number, default: 0 },
  // 评论累计
  comment_count: { type: Number, default: 0 },
  // 粉丝累计
  fans_count: { type: Number, default: 0 },

  // 获取赞的累计
  like_count: { type: Number, default: 0 },

  // 用户关注的节点
  follow_node: [{ type: ObjectId, ref: 'Node' }],
  follow_node_count: { type: Number, default: 0 },

  // 用户关注的人
  follow_people: [{ type: ObjectId, ref: 'User' }],
  follow_people_count: { type: Number, default: 0 },

  // 用户关注的节点
  follow_topic: [{ type: ObjectId, ref: 'Topic' }],
  follow_topic_count: { type: Number, default: 0 },

  follow_posts: [{ type: ObjectId, ref: 'Posts' }],
  follow_posts_count: { type: Number, default: 0 },

  // 最近一次查询Notification的日期
  find_notification_at: { type: Date }

  // 访问令牌
  // access_token: { type: String }
});



UserSchema.virtual('avatar_url').get(function () {

  return '//img.xiaoduyu.com/default_avatar.jpg'

  /*
  if (!this.avatar) {
    return config.domain + '/images/avatar/_thumbnail.jpg';
  }

  var myDate = new Date(this.create_at);
  var year = myDate.getFullYear();
  var month = (myDate.getMonth()+1);
  var day = myDate.getDate();

  if (month < 10) month = '0'+month;
  if (day < 10) day = '0'+day;

  var path = config.domain + '/avatar' + '/' + year + '/' + month + '/' + day + '/' + this._id + '_thumbnail.jpg';

  return path;
  */
});

UserSchema.set('toJSON', { getters: true });


mongoose.model('User', UserSchema);
