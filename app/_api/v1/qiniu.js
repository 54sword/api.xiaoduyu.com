
// 上传build目录里面的文件到七牛
var qiniu = require("qiniu");
var fs = require('fs');
var config = require("../../../config");
var Tools = require('../../common/tools');
var User = require('../../models').User;

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.qiniu.secretKey;

//要上传的空间
var bucket = config.qiniu.bucket;

//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket);
  return putPolicy.token();
}

exports.getToken = function(req, res, next) {
  /*
  var fileName = req.query.file_name

  if (!fileName) {
    res.send({
      success: false,
      message: 'error file name'
    })
    return
  }
  */
  var token = uptoken(bucket)

  if (token) {
    res.send({ success: true, data: {
      token: token,
      url: config.qiniu.url
    }})
  } else {
    res.send({ success: true, message: 17000 })
  }
}

exports.uploadImage = function(imgUrl, userId, callback) {

  Tools.download(imgUrl, 'public/', userId+".jpg", function(){
    
    var token = uptoken(bucket)

    //构造上传函数
    function uploadFile(uptoken, key, localFile, callback) {
      var extra = new qiniu.io.PutExtra();
      qiniu.io.putFile(uptoken, key, localFile, extra, callback);
    }

    //调用uploadFile上传
    uploadFile(token, '', 'public/'+userId+'.jpg', function(err, ret){
      if(!err) {
        User.update({ _id: userId }, { avatar: config.qiniu.url + '/' + ret.key + '?imageMogr2/auto-orient/thumbnail/!200' }, function(err){
          if (err) console.log(err);
          // 删除源文件
          fs.unlink('public/'+userId+'.jpg', function(){
            callback(true)
          })
        })
      } else {
        // 上传失败， 处理返回代码
        callback(false)
      }
    });

  });

}
