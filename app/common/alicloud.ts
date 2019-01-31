
// 大鱼短信sdk
const SMSClient = require('@alicloud/sms-sdk');
// import { alicloud } from '../../config'
import config from '../../config';
const { alicloud } = config;
 
if (alicloud.sms && alicloud.sms.accessKeyId && alicloud.sms.secretAccessKey) {
  var smsClient = new SMSClient({
    accessKeyId: alicloud.sms.accessKeyId,
    secretAccessKey: alicloud.sms.secretAccessKey
  })
}

// console.log(smsClient);

exports.sendSMS = function({ PhoneNumbers, SignName, TemplateCode, TemplateParam }, callback){

  if (!smsClient) {
    return callback('未配置阿里云SMS');
  }

  smsClient.sendSMS({
    PhoneNumbers,
    SignName: alicloud.sms.signName,
    TemplateCode: alicloud.sms.templateCode,
    TemplateParam: JSON.stringify(TemplateParam)
  }).then(function (res) {
    let { Code } = res
    if (Code === 'OK') {
      //处理返回参数
      callback(null)
    }
  }, function (err) {

    // console.log(err);

    if (err && err.code == 'isv.MOBILE_NUMBER_ILLEGAL') {
      callback('无效的手机号')
    } else {
      callback('短信发送失败')
    }

  })

}
