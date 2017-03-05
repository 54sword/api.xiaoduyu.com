var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var FollowSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  topic_id: { type: ObjectId, ref: 'Topic' },
  people_id: { type: ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('Follow', FollowSchema);
