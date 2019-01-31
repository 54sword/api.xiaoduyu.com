
import request from 'request'
import { yunpian } from '../../config'

let synthesis = (string, key, value) => {
  return string.replace(new RegExp("({"+key+"})","g"), value)
}

exports.sendSMS = function({ PhoneNumbers, SignName, TemplateCode, TemplateParam }, callback) {

  request.post({
    url:'https://sms.yunpian.com/v2/sms/single_send.json',
    form: {
      apikey: yunpian.international.apikey,
      mobile: PhoneNumbers,
      text: synthesis(yunpian.international.text, 'code', TemplateParam.code)
    }},
    function(err, httpResponse, body){
      // console.log(typeof body);
      // console.log(body);
      if (body) {

        try {
          body = JSON.parse(body);
          if (typeof body.code != 'undefined' && body.code == 0) {
            callback(null)
            return;
          }
        } catch (err) {

        }

      }

      callback('短信发送失败')
    })
}
