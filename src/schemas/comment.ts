
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new Schema({
  // 作者
  user_id: { type: ObjectId, ref: 'User' },
  // 帖子id
  posts_id: { type: ObjectId, ref: 'Posts' },
  // 父级
  parent_id: { type: ObjectId, ref: 'Comment' },
  // 回复某个feed的id
  reply_id: { type: ObjectId, ref: 'Comment' },
  // 内容
  content: { type: String, default: '' },
  // 内容HTML格式
  content_html: { type: String, default: '' },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 修改日期
  update_at: { type: Date },
  // 最后的回复时间
  last_reply_at: { type: Date },
  // 回复累积数量
  reply_count: { type: Number, default: 0 },
  // 回复ids
  reply: [{ type: ObjectId, ref: 'Comment' }],
  // 获得liek的总数
  like_count: { type: Number, default: 0 },
  // 设备
  device: { type: Number, default: 1 },
  // ip地址
  ip: { type: String, default: '' },
  // 是否被屏蔽
  blocked: { type: Boolean, default: false },
  // 删除标记
  deleted: { type: Boolean, default: false },
  // 是否是审核
  verify: { type: Boolean, default: true },
  // 削弱
  weaken: { type: Boolean, default: false },
  // 推荐
  recommend: { type: Boolean, default: false }
});

mongoose.model('Comment', CommentSchema);
