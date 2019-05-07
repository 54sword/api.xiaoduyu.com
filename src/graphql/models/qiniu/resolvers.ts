
import qiniu from 'qiniu'
import fs from 'fs'
import uuid from 'node-uuid'

import Download from '../../../utils/download'
import config from '../../../../config'

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.qiniu.secretKey;

//要上传的空间
const bucket = config.qiniu.bucket;

//构建上传策略函数
const uptoken = (bucket: string) => {
  var putPolicy = new qiniu.rs.PutPolicy(bucket);
  return putPolicy.token();
}

import To from '../../../utils/to'
import CreateError from '../../common/errors';

const qiniuToken = async (root: any, args: any, context: any, schema: any) => {

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

/**
 * 下载互联网图片，并上传到七牛
 */
export const downloadImgAndUploadToQiniu = function (imgUrl: string) {
  return new Promise(async (resolve, reject)=>{

    // 图片临时储存的名称
    let temporaryName = uuid.v4();

    await Download({
      uri: imgUrl,
      dir: 'public/',
      filename: temporaryName+".jpg"
    });

    // tools.download(imgUrl, 'public/', temporaryName+".jpg", function(){
    
      let token = uptoken(bucket);
  
      //构造上传函数
      function uploadFile(uptoken: string, key: string, localFile: string, callback: any) {
        let extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, callback);
      }
      
      //调用uploadFile上传
      uploadFile(token, '', 'public/'+temporaryName+'.jpg', function(err: any, ret: any){
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

  // });
}

export const query = { qiniuToken }
export const mutation = { }