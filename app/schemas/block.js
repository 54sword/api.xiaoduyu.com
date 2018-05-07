var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var BlockSchema = new Schema({
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

mongoose.model('Block', BlockSchema);
