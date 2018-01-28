
import Notification from '../../modelsa/notification'


exports.add = function(data, callback) {
  // 添加通知
  Notification.save(data, function(err){
    if (err) console.log(err)
    global.io.sockets.emit('notiaction', data.addressee_id);
    callback()
  })
}

exports.find = async (req, res) => {

  const user = req.user
  let { query, select, options } = req.arguments

  options.populate = [
    {
      path: 'sender_id',
      select: {
        '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1
      }
    }
  ]

  let list = await Notification.find({ query, select, options })

  res.send({ success: true, data: list, sql: { query, select, options } })
}


exports.update = async (req, res) => {

  const user = req.user
  let { query, update, options } = req.arguments

  console.log(update);

  if (!query._id) {
    return res.send({ success: false, error: 90002, error_data: { argument: 'query._id' } })
  }

  try {
    await Notification.update({ query, update, options })
    res.send({ success: true })
  } catch (err) {
    console.log(err);
    res.send({ success: false, error: 10003 })
  }

}
