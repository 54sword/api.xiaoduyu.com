
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * follow-posts: xx 关注了你的帖子
 * answer: xx 评论了你的主题
 * comment: xx 回复了你
 * follow-you: xx 关注了你
 * like-answer: xx 赞了你的答案
 * like-comment: xx 赞了你的评论
 * new-answer: xx 回答了 xx 问题
 */

var UserNotificationSchema = new Schema({
  type: { type: String },
  sender_id: { type: ObjectId, ref: 'User' },
  addressee_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  comment_id: { type: ObjectId, ref: 'Comment' },
  has_read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

UserNotificationSchema.index({ addressee_id: 1 });
UserNotificationSchema.index({ addressee_id: 1, create_at: -1, deleted: 1 });


mongoose.model('UserNotification', UserNotificationSchema);
