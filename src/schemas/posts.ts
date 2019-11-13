import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

import { emit } from '../socket'

const PostsSchema = new Schema({
  // 作者
  user_id: { type: ObjectId, ref: 'User' },
  // 标签
  topic_id: { type: ObjectId, ref: 'Topic' },
  // 类型，0提问，1分享
  type: { type: Number, default: 0 },
  // 标题
  title: { type: String, default: '' },
  // 内容
  content: { type: String, default: '' },
  // 内容转化后的HTML格式
  content_html: { type: String, default: '' },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 修改日期
  update_at: { type: Date },
  // 最后的回复时间
  last_comment_at: { type: Date },
  // 评论id
  comment: [{ type: ObjectId, ref: 'Comment' }],
  // 评论累积
  comment_count: { type: Number, default: 0 },
  // 回复累计
  reply_count: { type: Number, default: 0 },
  // 浏览次数
  view_count: { type: Number, default: 0 },
  // 关注累计
  follow_count: { type: Number, default: 0 },
  // 赞的累计数
  like_count: { type: Number, default: 0 },
  // 设备
  device: { type: Number, default: 1 },
  // ip地址
  ip: { type: String, default: '' },
  // 删除标记
  deleted: { type: Boolean, default: false },
  // 是否是审核
  verify: { type: Boolean, default: true },
  // 推荐
  recommend: { type: Boolean, default: false },
  // 削弱，将不出现在首页
  weaken: { type: Boolean, default: false },
  // 排序
  sort_by_date: { type: Date, default: Date.now }
});

// 查询收藏
PostsSchema.index({ _id: 1, deleted: 1, weaken: 1, last_comment_at: -1 });
// 首页发现posts查询
PostsSchema.index({ deleted: 1, weaken: 1, sort_by_date: -1 });
// 用户个人主页帖子查询
PostsSchema.index({ user_id: 1, create_at: -1, deleted: 1 });

PostsSchema.pre('save', function(next: any) {
  const self: any = this;
  
  // 验证通过发送全量通知
  if (self.verify) {
    emit('all', { type: 'discover' });
  }
  
  next();
});

mongoose.model('Posts', PostsSchema);
