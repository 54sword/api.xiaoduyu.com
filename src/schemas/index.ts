
import mongoose from 'mongoose'
import config from '../../config'
const { mongodbDebug, mongodbURI } = config

if (mongodbDebug) mongoose.set('debug', true)

mongoose.connect(mongodbURI, {
	useCreateIndex: true,
  useNewUrlParser: true
})

import './user'
import './account'
import './oauth'
import './comment'
import './like'
import './notification'
import './user-notification'
import './captcha'
import './posts'
import './topic'
import './follow'
import './token'
import './phone'
import './report'
import './block'
import './feed'
import './message'
import './session'

export const User = mongoose.model('User')
export const Account = mongoose.model('Account')
export const Oauth = mongoose.model('Oauth')
export const Captcha = mongoose.model('Captcha')
export const Token = mongoose.model('Token')
export const Phone = mongoose.model('Phone')
export const Report = mongoose.model('Report')
export const Posts = mongoose.model('Posts')
export const Comment = mongoose.model('Comment')
export const Topic = mongoose.model('Topic')
export const Follow = mongoose.model('Follow')
export const Like = mongoose.model('Like')
export const Notification = mongoose.model('Notification')
export const UserNotification = mongoose.model('UserNotification')
export const Block = mongoose.model('Block')
export const Feed = mongoose.model('Feed')
export const Message = mongoose.model('Message')
export const Session = mongoose.model('Session')