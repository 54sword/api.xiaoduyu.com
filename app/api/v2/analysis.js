import Notification from '../../modelsa/notification'
import UserNotification from '../../modelsa/user-notification'
import User from '../../modelsa/user'
import Posts from '../../modelsa/posts'
import Comment from '../../modelsa/comment'


exports.find = async (req, res) => {

  const user = req.user
  let { query, select, options } = req.arguments

  console.log(query);

  let userCount = await User.count({ query, select, options })
  let postsCount = await Posts.count({ query, select, options })
  let commentCount = await Comment.count({ query, select, options })
  let notificationCount = await Notification.count({ query, select, options })
  let userNotificationCount = await UserNotification.count({ query, select, options })

  let data = {
    user_count: userCount,
    posts_count: postsCount,
    comment_count: commentCount,
    notification_count: notificationCount,
    userNotification_count: userNotificationCount
  }

  res.send({
    success: true,
    data
  })

}
