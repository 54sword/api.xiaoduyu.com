
import request from 'request'
import config from '../../config'
import synthesis from '../utils/synthesis'

const { yunpian } = config

interface Param{
  PhoneNumbers: string
  TemplateParam: {
    code: number
  }
}

export const sendSMS = ({ PhoneNumbers, TemplateParam }: Param): Promise<object> => {
  return new Promise((resolve, reject)=>{

    if (!yunpian.international ||
      yunpian.international.apikey ||
      yunpian.international.text
      ) {
        return reject('未配置云片国际短信');
      }

    request.post({
      url:'https://sms.yunpian.com/v2/sms/single_send.json',
      form: {
        apikey: yunpian.international.apikey,
        mobile: PhoneNumbers,
        text: synthesis(yunpian.international.text, { code: TemplateParam.code })
      }},
      function(err: any, httpResponse: any, body: any){

        if (body) {
          try {
            body = JSON.parse(body);
            if (typeof body.code != 'undefined' && body.code == 0) {
              resolve()
            } else {
              reject(body.detail || body.http_status_code)
            }
          } catch (err) {
            reject('短信发送失败')
          }
          return;
        }

        reject('短信发送失败')
      })

  })
}
