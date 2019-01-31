import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const BlockSchema = new Schema({
  // 用户自己
  user_id: { type: ObjectId, ref: 'User' },
  // 屏蔽的帖子
  posts_id: { type: ObjectId, ref: 'Posts' },
  // 屏蔽的评论
  comment_id: { type: ObjectId, ref: 'Comment' },
  // 屏蔽的用户
  people_id: { type: ObjectId, ref: 'User' },
  // 删除状态
  deleted: { type: Boolean, default: false },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // ip地址
  ip: { type: String, default: '' }
});

// 组合唯一索引
BlockSchema.index({ user_id: 1, posts_id: 1, comment_id: 1, people_id: 1 }, { unique: true });

mongoose.model('Block', BlockSchema);
