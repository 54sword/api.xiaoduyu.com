
// 大鱼短信sdk
import SMSClient from '@alicloud/sms-sdk'
import config from '../config'
const { alicloud } = config
 
if (alicloud.sms && alicloud.sms.accessKeyId && alicloud.sms.secretAccessKey) {
  var smsClient = new SMSClient({
    accessKeyId: alicloud.sms.accessKeyId,
    secretAccessKey: alicloud.sms.secretAccessKey
  })
}

interface Param{
  PhoneNumbers: string
  TemplateParam: {
    code: number
  }
}

export const sendSMS = ({ PhoneNumbers, TemplateParam }:Param): Promise<object> => {
  return new Promise((resolve, reject)=>{

    if (!smsClient) return reject('未配置阿里云SMS');
  
    smsClient.sendSMS({
      PhoneNumbers,
      SignName: alicloud.sms.signName,
      TemplateCode: alicloud.sms.templateCode,
      TemplateParam: JSON.stringify(TemplateParam)
    }).then(function (res: any) {
      let { Code } = res
      if (Code === 'OK') {
        //处理返回参数
        resolve()
      }
    }, function (err: any) {
      if (err && err.code == 'isv.MOBILE_NUMBER_ILLEGAL') {
        reject('无效的手机号')
      } else {
        reject('短信发送失败')
      }
  
    })

  })
}
