
import mongoose from 'mongoose'
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const MessageSchema = new Schema({
  // 发件人
  user_id: { type: ObjectId, ref: 'User' },
  // 接收人
  addressee_id: { type: ObjectId, ref: 'User' },
  // 消息类型 1：普通消息，2：系统消息
  type: { type: Number, default: 1 },
  // 内容
  content: { type: String, default: '' },
  // 内容HTML格式
  content_html: { type: String, default: '' },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 设备
  device: { type: Number, default: 1 },
  // ip地址
  ip: { type: String, default: '' },
  // 是否已读
  has_read: { type: Boolean, default: false },
  // 是否被屏蔽
  blocked: { type: Boolean, default: false },
  // 删除标记
  deleted: { type: Boolean, default: false }
})

mongoose.model('Message', MessageSchema)
