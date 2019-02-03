// https://github.com/jpush/jpush-api-nodejs-client/blob/master/doc/api.md
import JPush from 'jpush-sdk/lib/JPush/JPush.js'
import config from '../config'

const { debug, jpush } = config

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


export const pushCommentToUser = function({ posts, comment, user }) {

  if (!jpush.appKey || !jpush.masterSecret || debug) return;

  var client = JPush.buildClient(jpush.appKey, jpush.masterSecret);

  let commentContent = comment.content_html.replace(/<[^>]+>/g,"");
  let summary = commentContent;
  if (summary.length > 20) summary = summary.slice(0, 20);

  let titleIOS = user.nickname + ': ' + commentContent;
  if (titleIOS.length > 40) titleIOS = titleIOS.slice(0, 40) + '...';

  let titleAndroid = commentContent;
  if (titleAndroid.length > 40) titleAndroid = titleAndroid.slice(0, 40) + '...';
  
  client.push()
    .setPlatform(JPush.ALL)
    // 广播特定的用户
    .setAudience(JPush.alias(posts.user_id + ''))
    .setNotification(titleIOS,
      JPush.ios(titleIOS, 'comment', 1, true, {
        routeName: 'Notifications', params: { update: true }
        // routeName: 'CommentDetail', params: { title:summary, id:comment._id }
      }),
      JPush.android(user.nickname, titleAndroid, 1, {
        routeName: 'Notifications', params: { update: true }
        // routeName: 'CommentDetail', params: { title:summary, id:comment._id }
      })
    )
    // 开启正式环境的推送
    .setOptions(null, null, null, true)
    .send(function(err, res) {
      if (err) console.log(err.message)
    })

}

export const pushReplyToUser = function({ comment, reply, user }) {

  if (!jpush.appKey || !jpush.masterSecret || debug) return;

  var client = JPush.buildClient(jpush.appKey, jpush.masterSecret);

  let replyContent = reply.content_html.replace(/<[^>]+>/g,"");
  let summaryComment = comment.content_html.replace(/<[^>]+>/g,"");
  if (summaryComment.length > 20) summaryComment = summaryComment.slice(0, 20);

  let titleIOS = user.nickname + ': ' + replyContent;
  if (titleIOS.length > 40) titleIOS = titleIOS.slice(0, 40) + '...';

  let titleAndroid = replyContent;
  if (titleAndroid.length > 40) titleAndroid = titleAndroid.slice(0, 40) + '...';

  client.push()
    .setPlatform(JPush.ALL)
    // 广播特定的用户
    .setAudience(JPush.alias(reply.reply_id && reply.reply_id.user_id  ? reply.reply_id.user_id._id + '' : reply.reply_id + ''))
    .setNotification(titleIOS,
      JPush.ios(titleIOS, 'comment', 1, true, {
        routeName: 'Notifications', params: { update: true }
        // routeName: 'CommentDetail', params: { title:summaryComment, id:comment._id }
      }),
      JPush.android(user.nickname, titleAndroid, 1, {
        routeName: 'Notifications', params: { update: true }
        // routeName: 'CommentDetail', params: { title:summaryComment, id:comment._id }
      })
    )
    // 开启正式环境的推送
    .setOptions(null, null, null, true)
    .send(function(err, res) {
      if (err) console.log(err.message)
    })

}
