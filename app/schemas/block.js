var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var BlockSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  // topic_id: { type: ObjectId, ref: 'Topic' },
  people_id: { type: ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
})

// BlockSchema.index({ user_id: 1 })
// BlockSchema.index({ user_id: 1, posts_id: 1 })
// BlockSchema.index({ user_id: 1, people_id: 1 })

mongoose.model('Block', BlockSchema);
