import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const BlockSchema = new Schema({
  // 用户自己
  user_id: { type: ObjectId, ref: 'User' },
  pc_img: { type: String },
  pc_url: { type: String },
  app_img: { type: String },
  app_url: { type: String },
  close: { type: Boolean, default: false },
  // 屏蔽广告日期
  block_date: { type: Date, default: Date.now },
  // 删除状态
  deleted: { type: Boolean, default: false },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 更新日期
  update_at: { type: Date, default: Date.now }
});

// 组合唯一索引
BlockSchema.index({ user_id: 1 }, { unique: true });

mongoose.model('AD', BlockSchema);
