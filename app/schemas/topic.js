
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var TopicSchema = new Schema({
  // 创建人
  user_id: { type: ObjectId, ref: 'User' },
  // 父级
  parent_id: { type: ObjectId, ref: 'Topics' },
  // 名称
  name: { type: String, default: '', unique: true },
  // 简要
  brief: { type: String, default: '' },
  // 详情描述
  description: { type: String, default: '' },
  // 节点图标
  avatar: { type: String, default: '' },
  // 背景图
  background: { type: String, default: '' },
  // 关注总数
  follow_count: { type: Number, default: 0 },
  // 提问累计
  posts_count: { type: Number, default: 0 },
  // 评论的总数
  comment_count: { type: Number, default: 0 },
  // 排序
  sort: { type: Number, default: 0 },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 语言 0 -> 中文
  language: { type: Number, default: 0 },
  // 推荐节点
  recommend: { type: Boolean, default: false }
});

mongoose.model('Topic', TopicSchema);
