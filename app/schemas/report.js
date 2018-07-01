import mongoose from 'mongoose';

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId
const ReportSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  comment_id: { type: ObjectId, ref: 'Comment' },
  people_id: { type: ObjectId, ref: 'User' },
  report_id: { type: Number },
  detail: { type: String },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('Report', ReportSchema);
