// var JPush = require("jpush-sdk/lib/JPush/JPush.js")
import JPush from 'jpush-sdk/lib/JPush/JPush.js'
import { jpush } from '../../config'

/*
exports.pushPostsToSignInUser = function({ posts, user }) {

  let title = user.nickname + ' 评论了你的帖子'

  client.push()
    .setPlatform(JPush.ALL)
    // 广播特定的用户
    // .setAudience(JPush.alias(user._id))
    // 广播所有设备
    // .setAudience(JPush.ALL)
    // 广播已经登陆的用户
    .setAudience(JPush.tag('signin'))
    .setNotification(title,
      JPush.ios(title, 'happy', 1, true, {
        // routeName: 'NewsDetail', params: { title:'iPhone 8首发评测:新旧时代的分水岭', id:'Dr67BRwvm182Lo84' }
        routeName: 'PostsDetail', params: { title:posts.title, id:posts._id }
      })
    )
    // 开启正式环境的推送
    .setOptions(null, null, null, jpush.production)
    .send(function(err, res) {
      if (err) {
        console.log(err.message)
      }
    });

}
*/


exports.pushCommentToUser = function({ posts, comment, user }) {

  if (!jpush.appKey || !jpush.masterSecret) return

  var client = JPush.buildClient(jpush.appKey, jpush.masterSecret)

  let commentContent = comment.content_html.replace(/<[^>]+>/g,"")
  let summary = commentContent
  if (summary.length > 20) summary = summary.slice(0, 20)

  let title = user.nickname + ': ' + commentContent
  if (title.length > 40) title = title.slice(0, 40) + '...'

  client.push()
    .setPlatform(JPush.ALL)
    // 广播特定的用户
    .setAudience(JPush.alias(posts.user_id + ''))
    .setNotification(title,
      JPush.ios(title, 'comment', 1, true, {
        routeName: 'CommentDetail', params: { title:summary, id:comment._id }
      }),
      JPush.android(title, title, 1, {
        routeName: 'CommentDetail', params: { title:summary, id:comment._id }
      })
    )
    // 开启正式环境的推送
    .setOptions(null, null, null, jpush.production)
    .send(function(err, res) {
      if (err) console.log(err.message)
    })

}

exports.pushReplyToUser = function({ comment, reply, user }) {

  if (!jpush.appKey || !jpush.masterSecret) return

  var client = JPush.buildClient(jpush.appKey, jpush.masterSecret)

  let replyContent = reply.content_html.replace(/<[^>]+>/g,"")
  let summaryComment = comment.content_html.replace(/<[^>]+>/g,"")
  if (summaryComment.length > 20) summaryComment = summaryComment.slice(0, 20)

  let title = user.nickname + ': ' + replyContent
  if (title.length > 40) title = title.slice(0, 40) + '...'

  client.push()
    .setPlatform(JPush.ALL)
    // 广播特定的用户
    .setAudience(JPush.alias(reply.reply_id.user_id._id + ''))
    .setNotification(title,
      JPush.ios(title, 'comment', 1, true, {
        routeName: 'CommentDetail', params: { title:summaryComment, id:comment._id }
      }),
      JPush.android(title, title, 1, {
        routeName: 'CommentDetail', params: { title:summaryComment, id:comment._id }
      })
    )
    // 开启正式环境的推送
    .setOptions(null, null, null, jpush.production)
    .send(function(err, res) {
      if (err) console.log(err.message)
    })

}
