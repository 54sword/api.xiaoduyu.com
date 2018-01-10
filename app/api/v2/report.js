
import { Report, User, Comment, Posts } from '../../models'
import async from 'async'

exports.getList = (req, res, next) => {
  let data = [
    { id: 1, text: '垃圾营销' },
    { id: 2, text: '淫秽色情' },
    { id: 3, text: '不实信息' },
    { id: 4, text: '人身攻击我' },
    { id: 5, text: '有害信息' },
    { id: 6, text: '抄袭我的内容' },
    { id: 7, text: '违法信息' }
  ]
  // 需要补充举报说明：
  res.send({
    success: true,
    data
  })
}

exports.add = function(req, res, next) {

  const user = req.user
  const { posts_id, people_id, comment_id, report_id, detail } = req.body

  async.waterfall([

    (callback) => {

      if (!user || !posts_id && !people_id && !comment_id || !report_id) {
        callback(10005)
      } else {
        callback(null)
      }

    },

    (callback) => {

      if (!posts_id) return callback(null)

      Posts.findOne({ _id: posts_id }, {}, (err, post)=>{
        if (err) console.log(err);
        if (!post) {
          callback(11000)
        } else {
          callback(null)
        }
      })

    },

    (callback) => {

      if (!people_id) return callback(null)

      User.findOne({ _id: people_id }, {}, (err, user)=>{
        if (err) console.log(err);
        if (!user) {
          callback(13000)
        } else {
          callback(null)
        }
      })

    },

    (callback) => {

      if (!comment_id) return callback(null)

      Comment.findOne({ _id: comment_id }, {}, (err, comment)=>{
        if (err) console.log(err);
        if (!comment) {
          callback(12000)
        } else {
          callback(null)
        }
      })

    },

    (callback) => {

      let query = {
        // 三天内不能重复提交
        create_at:  { '$lt': new Date().getTime(), '$gt': new Date().getTime() - 1000*60*60*24*3 }
      }

      if (posts_id) query.posts_id = posts_id
      if (people_id) query.people_id = people_id
      if (comment_id) query.comment_id = comment_id

      Report.findOne({
        query,
        callback: (err, result)=>{
          if (err) console.log(err)
          if (result) {
            callback(50000)
          } else {
            callback(null)
          }
        }
      })

    },

    (callback) => {

      let data = { user_id: user._id, report_id }
      if (detail) data.detail = detail
      if (posts_id) data.posts_id = posts_id
      if (people_id) data.people_id = people_id
      if (comment_id) data.comment_id = comment_id

      Report.save({
        data,
        callback: (err)=>{
          if (err) console.log(err)
          callback(null)
        }
      })
    }

  ], function(err){

    if (err) {
      return res.send({ success: false, error: err })
    }

    return res.send({ success: true })
  });

};
