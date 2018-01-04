var Notification = require('../../models').Notification;

// console.log(Notification);

exports.add = function(data, callback) {
  // 添加通知
  Notification.save(data, function(err){
    if (err) console.log(err)

    global.io.sockets.emit('notiaction', data.addressee_id);

    callback()
  })
}
