import https from 'https';
import qs from 'querystring';
import request from 'request';

import config from '../../../config';

let param: any = null;

if (config.baidu && config.baidu.appKey && config.baidu.appSecret) {
  param = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': config.baidu.appKey,
    'client_secret': config.baidu.appSecret
  });
}

// 文本内容审核
export default function(content: string) {
  return new Promise(async (resolve)=>{

    // 没有提供百度配置
    if (!param || !content) return resolve(true);
    //  || config.debug

    await getAccessToken();

    spam(content).then((res)=>{
      resolve(res);
    }).catch(res=>{
      // 如果审核异常，先认为审核通过
      console.log(res);
      resolve(true);
    });
    
  })
}


let lastDate: number, data: any;

const getAccessToken = function() {

  return new Promise((resolve) => {

    if (lastDate && data && Math.ceil(new Date().getTime()/1000) < lastDate) {
      resolve(data.access_token);
      return;
    }

    https.get(
      {
        hostname: 'aip.baidubce.com',
        path: '/oauth/2.0/token?' + param,
        agent: false
      },
      function (res: any) {
        var json = '';
        
        res.on('data', function (d: any) {
            json += d;
        });

        res.on('end',function(){
          //获取到的数据
          json = JSON.parse(json);
          data = json;
          lastDate = Math.ceil(new Date().getTime()/1000) + data.expires_in;
          resolve(data.access_token);
        });
      }
    ).on('error', (e: any) => {
      console.log(e);
      resolve();
    });;

  })

}

const spam = function(content: string) {
  return new Promise(resolve=>{

    if (!data.access_token) {
      resolve(true);
      return
    }

    // http://ai.baidu.com/docs#/TextCensoring-API/top
    request.post('https://aip.baidubce.com/rest/2.0/antispam/v2/spam?access_token='+data.access_token, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        content
      }
    }, function(err: any, response: any, body: any){

      if (body) body = JSON.parse(body);

      // console.log(body.result);

      // +spam	int	请求中是否包含违禁，0表示非违禁，1表示违禁，2表示建议人工复审
      if (body && body.result && body.result.spam == 1) {
        resolve(false)
      } else {
        resolve(true)
      }

    });

  })
}

