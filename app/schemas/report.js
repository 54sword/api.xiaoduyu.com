// var mongoose = require('mongoose')
// var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId

import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId
const ReportSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  posts_id: { type: ObjectId, ref: 'Posts' },
  comment_id: { type: ObjectId, ref: 'Comment' },
  people_id: { type: ObjectId, ref: 'User' },
  report_id: { Type: Number },
  detail: { Type: String },
  create_at: { type: Date, default: Date.now }
})

mongoose.model('Report', ReportSchema)
