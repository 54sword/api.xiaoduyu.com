
// 大鱼短信sdk
const SMSClient = require('@alicloud/sms-sdk')
import { alicloud } from '../../config'


if (alicloud.sms && alicloud.sms.accessKeyId && alicloud.sms.secretAccessKey) {
  var smsClient = new SMSClient({
    accessKeyId: alicloud.sms.accessKeyId,
    secretAccessKey: alicloud.sms.secretAccessKey
  })
}

exports.sendSMS = function({ PhoneNumbers, SignName, TemplateCode, TemplateParam }, callback){

  smsClient.sendSMS({
    PhoneNumbers,
    SignName,
    TemplateCode,
    TemplateParam: JSON.stringify(TemplateParam)
  }).then(function (res) {
    let { Code } = res
    if (Code === 'OK') {
      //处理返回参数
      callback(null)
    }
  }, function (err) {
    if (err && err.code == 'isv.MOBILE_NUMBER_ILLEGAL') {
      callback(30001)
    } else {
      callback(30000)
    }

  })

}
