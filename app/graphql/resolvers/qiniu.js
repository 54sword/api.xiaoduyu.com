
import qiniu from 'qiniu';
import fs from 'fs';
import tools from '../../common/tools';
import config from '../../../config';
import uuid from 'node-uuid';

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.qiniu.secretKey;

//要上传的空间
const bucket = config.qiniu.bucket;

//构建上传策略函数
const uptoken = (bucket, key) => {
  var putPolicy = new qiniu.rs.PutPolicy(bucket);
  return putPolicy.token();
}

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'

query.qiniuToken = async (root, args, context, schema) => {

  const { user, role } = context

  if (!user) {
    throw CreateError({
      message: '没有权限访问',
      data: { }
    });
  }

  const token = uptoken(bucket);

  if (!token) {
    throw CreateError({
      message: 'token 创建失败',
      data: { }
    });
  }

  return {
    token: token,
    url: config.qiniu.url
  }
}

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;

/**
 * 下载互联网图片，并上传到七牛
 */
exports.downloadImgAndUploadToQiniu = function (imgUrl) {
  return new Promise((resolve, reject)=>{

    // 图片临时储存的名称
    let temporaryName = uuid.v4();

    tools.download(imgUrl, 'public/', temporaryName+".jpg", function(){
    
      let token = uptoken(bucket);
  
      //构造上传函数
      function uploadFile(uptoken, key, localFile, callback) {
        let extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, callback);
      }
      
      //调用uploadFile上传
      uploadFile(token, '', 'public/'+temporaryName+'.jpg', function(err, ret){
        if(!err) {

          try{          // 删除文件
            fs.unlink('public/'+temporaryName+'.jpg', function(){
              resolve(config.qiniu.url + '/' + ret.key);
            });
          } catch (err) {
            console.log(err);
            // 上传失败， 处理返回代码
            reject('delet image error');
          }

        } else {
          console.log(err);
          // 上传失败， 处理返回代码
          reject('upload error');
        }
      });
  
    });

  });
}