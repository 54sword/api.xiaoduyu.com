
import captchapng from 'captchapng';

import { Captcha } from '../models';
import To from '../common/to';

import CreateError from '../graphql/common/errors';


// 显示验证码图片
exports.showImage = async (req, res, next) => {

  const id = req.params.id;

  let [ err, result ] = await To(Captcha.findOne({
    query: { _id: id }
  }))

  if (err || !result) {

    throw CreateError({
      message: '验证码不存在',
      data: { errorInfo: err ? err.message : '' }
    })
  }

  var p = new captchapng(80,30,result.captcha); // width,height,numeric captcha
      p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
      p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, { 'Content-Type': 'image/png' });

  res.end(imgbase64);

  // const { token, buffer } = await captcha()
  // var imgbase64 = new Buffer(buffer,'base64');
  // res.writeHead(200, { 'Content-Type': 'image/png' });
  // res.end(imgbase64);


  /*
  var captcha = svgCaptcha.create({
    size: 6,
    text: '123333'
  });

  res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
  */

};
