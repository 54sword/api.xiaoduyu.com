
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LiveSchema = new Schema({
  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User' },
  // 标题
  title: { type: String, default: '' },
  // 公告
  notice: { type: String, default: '' },
  // 封面
  cover_image: { type: String, default: '' },
  // 浏览次数
  view_count: { type: Number, default: 0 },
  // 发言次数
  talk_count: { type: Number, default: 0 },
  // 在线观众ip
  audience: [{ type: String }],
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 上次直播的时间
  last_time: { type: Date },
  // 是否正在直播
  status: { type: Boolean, default: false },
  // 禁止
  ban_date: { type: Date, default: Date.now },
  // 屏蔽
  blocked: { type: Boolean, default: false }
});

LiveSchema.index({ user_id: 1 }, { unique: true });

LiveSchema.set('toJSON', { getters: true });

mongoose.model('Live', LiveSchema);
