import captchapng from 'captchapng'
// import svgCaptcha from 'svg-captcha'

import { Captcha } from '../models'
import To from '../utils/to'

// 显示验证码图片
export const showImage = async (req: any, res: any, next: any) => {

  const id = req.params.id;

  let [ err, result ] = await To(Captcha.findOne({
    query: { _id: id }
  }))

  if (err || !result) {
    res.status(404);
    res.send('404 not found');
    return
  }

  var p = new captchapng(90,36,result.captcha); // width,height,numeric captcha
      p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
      p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, { 'Content-Type': 'image/png' });

  res.end(imgbase64);
  
  /*
  // svg 在app客户端中不支持
  var captcha = svgCaptcha(result.captcha, {
    width: 90,
    height: 36,
    fontSize: 45,
    background: '#dbdbdb'
  });

  res.type('svg');
  res.status(200).send(captcha);
  */

};


