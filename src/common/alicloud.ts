// 大鱼短信sdk
import SMSClient from '@alicloud/sms-sdk'
import ALY from 'aliyun-sdk'
import config from '../../config'
const { alicloud } = config

// 短信
if (alicloud.sms && alicloud.accessKeyId && alicloud.secretAccessKey) {
  var smsClient = new SMSClient({
    accessKeyId: alicloud.accessKeyId,
    secretAccessKey: alicloud.secretAccessKey
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


// 推送通知
var push: any = null;

// 短信
if (alicloud.push && alicloud.accessKeyId && alicloud.secretAccessKey) {
  push = new ALY.PUSH({
    accessKeyId: config.alicloud.accessKeyId,
    secretAccessKey: config.alicloud.secretAccessKey,
    endpoint: 'http://cloudpush.aliyuncs.com',
    apiVersion: '2016-08-01'
  });
}


interface pushToAccountInterface{
  // 用户的id
  userId: string
  // 标题
  title: string
  // 内容
  body: string
  // 简介
  summary: string
  // 参数
  params: object
}

// 给用户发送通知
export const pushToAccount = ({ userId, title, body, summary, params }: pushToAccountInterface) => {

  if (!push) return;

  // https://help.aliyun.com/document_detail/32402.html
  // https://help.aliyun.com/document_detail/30084.html?spm=a2c4g.11186623.6.569.3452103beRtJhm
  // https://help.aliyun.com/document_detail/32402.html?spm=a2c4g.11186623.6.584.1cc44840FH9p2J

  // https://github.com/aliyun/alicloud-ams-demo/blob/master/OpenApi2.0/push-openapi-nodejs-demo/Push.js

  // ios
  
  push.push({
    AppKey: alicloud.push.iOSAppKey,
    Action: 'Push',
    //推送目标: DEVICE:按设备推送 ALIAS : 按别名推送 ACCOUNT:按帐号推送  TAG:按标签推送; ALL: 广播推送
    Target: 'ACCOUNT', 
    //根据Target来设定，如Target=DEVICE, 则对应的值为 设备id1,设备id2. 多个值使用逗号分隔.(帐号与设备有一次最多100个的限制)
    TargetValue: userId,
    PushType: "NOTICE", //消息类型 MESSAGE NOTICE
    //设备类型 ANDROID iOS ALL.
    DeviceType: "iOS",
    Title: title,
    Body: body,

    //iOS相关配置
    // iOSBadge: 5,//iOS应用图标右上角角标
    iOSSilentNotification: false,//是否开启静默通知
    iOSMusic: 'default',//iOS通知声音
    iOSApnsEnv: config.debug ? 'DEV' : 'PRODUCT',//iOS的通知是通过APNs中心来发送的，需要填写对应的环境信息。"DEV" : 表示开发环境 "PRODUCT" : 表示生产环境
    iOSRemind: true,//消息推送时设备不在线（既与移动推送的服务端的长连接通道不通），则这条推送会做为通知，通过苹果的APNs通道送达一次。注意：离线消息转通知仅适用于生产环境
    iOSRemindBody: "iOSReminfBody",//iOS消息转通知时使用的iOS通知内容，仅当iOSApnsEnv=PRODUCT && iOSRemind为true时有效
    iOSExtParameters: JSON.stringify(params),//通知的扩展属性(注意 : 该参数要以json map的格式传入,否则会解析出错)
    
  }, function (err: any, res: any) {
    if (err) console.log(err);
    // console.log(err, res);
  });


  // android
  push.push({

    AppKey: alicloud.push.androidAppKey,
    Action: 'Push',
    //推送目标: DEVICE:按设备推送 ALIAS : 按别名推送 ACCOUNT:按帐号推送  TAG:按标签推送; ALL: 广播推送
    Target: 'ACCOUNT', 
    //根据Target来设定，如Target=DEVICE, 则对应的值为 设备id1,设备id2. 多个值使用逗号分隔.(帐号与设备有一次最多100个的限制)
    TargetValue: userId,
    PushType: "NOTICE", //消息类型 MESSAGE NOTICE
    //设备类型 ANDROID iOS ALL.
    DeviceType: "ANDROID",
    Title: title,
    Body: body,

    //android相关配置
    AndroidNotifyType: "SOUND", //通知的提醒方式 "VIBRATE" : 震动 "SOUND" : 声音 "BOTH" : 声音和震动 NONE : 静音
    AndroidNotificationBarType: 50, //通知栏自定义样式0-100
    AndroidNotificationBarPriority: 2,
    AndroidOpenType: "APPLICATION", //点击通知后动作 "APPLICATION" : 打开应用 "ACTIVITY" : 打开AndroidActivity "URL" : 打开URL "NONE" : 无跳转
    // AndroidOpenUrl: "http://www.aliyun.com", //Android收到推送后打开对应的url,仅当AndroidOpenType="URL"有效
    AndroidActivity: "com.xiaoduyureactnative.MainActivity", //设定通知打开的activity,仅当AndroidOpenType="Activity"有效
    AndroidExtParameters: JSON.stringify(params), //通知的扩展属性(注意 : 该参数要以json map的格式传入,否则会解析出错)
    AndroidNotificationChannel: '1',
    
    AndroidPopupActivity: 'com.xiaoduyureactnative.MainActivity',
    AndroidPopupTitle: title,
    AndroidPopupBody: body,

    //推送控制
    //可以设置成你指定固定时间
    // PushTime: (new Date((new Date()).getTime() + 3600 * 1000)).toISOString().replace(/\.\d\d\d/g,''),
    // 离线消息的过期时间，过期则不会再被发送。离线消息最长保存72小时，过期时间时长不会超过发送时间加72小时。时间格式按照ISO8601标准表示，并需要使用UTC时间，格式为YYYY-MM-DDThh:mm:ssZ
    // ExpireTime: (new Date((new Date()).getTime() + 12 * 3600 * 1000)).toISOString().replace(/\.\d\d\d/g,''),
    StoreOffline: true//离线消息是否保存,若保存, 在推送时候，用户即使不在线，下一次上线则会收到
  }, function (err: any, res: any) {
    if (err) console.log(err);
    // console.log(err, res);
  });
  

  /*
  // ios
  push.push({
    AppKey: alicloud.push.iOSAppKey,
    DeviceType: 0,
    Target: 'account',
    TargetValue: userId,
    Type:1,
    Title: title,
    Body: body,
    ApnsEnv: config.debug ? 'DEV' : 'PRODUCT',
    // iOSMutableContent: true,
    iOSExtParameters: JSON.stringify(params),
    Summary: summary
  }, function (err: any, res: any) {
    console.log(err, res);
  });
  
  // android
  push.push({
    AppKey: alicloud.push.androidAppKey,
    DeviceType: 1,
    Target: 'account',
    TargetValue: userId,
    Type:1,
    Title: title,
    Body: body,
    ApnsEnv: config.debug ? 'DEV' : 'PRODUCT',
    AndroidExtParameters: JSON.stringify(params),
    Summary: summary
    // AndroidNotificationChannel: 1
  }, function (err: any, res: any) {
    console.log(err, res);
  });
  */
  
  
}