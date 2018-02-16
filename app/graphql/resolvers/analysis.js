
import Notification from '../../modelsa/notification'
import UserNotification from '../../modelsa/user-notification'
import User from '../../modelsa/user'
import Posts from '../../modelsa/posts'
import Comment from '../../modelsa/comment'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
// import CreateError from './errors'
import Querys from '../querys'
// import Updates from '../updates'

query.analysis = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}
  let { query, options } = Querys(args, 'analysis')

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  //===
  let err, userCount, postsCount, commentCount, notificationCount, userNotificationCount;

  [ err, userCount ] = await To(User.count({ query, select, options }));
  [ err, postsCount ] = await To(Posts.count({ query, select, options }));
  [ err, commentCount ] = await To(Comment.count({ query, select, options }));
  [ err, notificationCount ] = await To(Notification.count({ query, select, options }));
  [ err, userNotificationCount ] = await To(UserNotification.count({ query, select, options }));

  return {
    user_count: userCount,
    posts_count: postsCount,
    comment_count: commentCount,
    notification_count: notificationCount,
    userNotification_count: userNotificationCount
  }
}


exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
