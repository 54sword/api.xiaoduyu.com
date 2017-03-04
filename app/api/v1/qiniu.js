
// 上传build目录里面的文件到七牛
var qiniu = require("qiniu");
var config = require("../../../configs/config");

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
