import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const FollowSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  topic_id: { type: ObjectId, ref: 'Topic' },
  people_id: { type: ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

FollowSchema.index({ user_id: 1, posts_id: 1, topic_id: 1, people_id: 1 }, { unique: true });

mongoose.model('Follow', FollowSchema);
