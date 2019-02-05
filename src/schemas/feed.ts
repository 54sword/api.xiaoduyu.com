
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

import { emit } from '../socket'

// 动态流
const Feed = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  topic_id: { type: ObjectId, ref: 'Topic' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  comment_id: { type: ObjectId, ref: 'Comment' },
  recommend: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

Feed.pre('save', function(next: any) {
  emit('member', { type: 'new-feed' });
  next();
});

Feed.index({ user_id: 1, topic_id: 1, posts_id: 1, comment_id: 1 }, { unique: true });

mongoose.model('Feed', Feed);
