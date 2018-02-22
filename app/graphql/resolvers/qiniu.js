
import qiniu from "qiniu";
import config from "../../../config";

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

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
