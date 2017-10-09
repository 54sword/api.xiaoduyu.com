
// 大鱼短信sdk
const SMSClient = require('@alicloud/sms-sdk')
const { alicloud } from '../../config'


if (alicloud.sms && alicloud.sms.accessKeyId && alicloud.sms.secretAccessKey) {
  let smsClient = new SMSClient({
    accessKeyId: alicloud.sms.accessKeyId,
    secretAccessKey: alicloud.sms.secretAccessKey
  })
}

exports.send = function({ PhoneNumbers, SignName, TemplateCode, TemplateParam }, callback){

  smsClient.sendSMS({
      PhoneNumbers,
      SignName,
      TemplateCode,
      TemplateParam: JSON.stringify(TemplateParam)
  }).then(function (res) {
      let {Code} = res
      if (Code === 'OK') {
          //处理返回参数
          console.log(res)
      }
  }, function (err) {
      console.log(err)
  })

};

/*
smsClient.sendSMS({
    PhoneNumbers: '1500000000',
    SignName: '云通信产品',
    TemplateCode: 'SMS_000000',
    TemplateParam: '{"code":"12345","product":"云通信"}'
}).then(function (res) {
    let {Code}=res
    if (Code === 'OK') {
        //处理返回参数
        console.log(res)
    }
}, function (err) {
    console.log(err)
})
*/
