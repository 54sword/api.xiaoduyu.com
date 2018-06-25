import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * feed
 * comment
 */

/*
 * mood
 * 0: 赞
 * 1: 喜欢
 */

const LikeSchema = new Schema({
  user_id: { type: ObjectId },
  type: { type: String },
  target_id: { type: ObjectId },
  mood: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

LikeSchema.index({ user_id: 1, type: 1, target_id: 1, mood: 1 }, { unique: true });

mongoose.model('Like', LikeSchema);
