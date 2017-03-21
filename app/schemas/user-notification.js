
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * follow-posts: xx 关注了你的帖子
 * comment: xx 评论了你的帖子
 * reply: xx 回复了你的 xx 回复
 * follow-you: xx 关注了你
 * like-comment: xx 赞了你的评论
 * like-reply: xx 赞了你的回复
 * new-comment: xx 评论了 xx 帖子
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
