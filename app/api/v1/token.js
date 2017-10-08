var Token = require('../../models').Token;
var JWT = require('../../common/jwt');
var Tools = require('../../common/tools');

/*
exports.check = function(req, res, next) {

  var token = String(req.headers.accesstoken || req.body.access_token || '');
  var userId = req.body.user_id;
  var ip = Tools.getIP(req);

  let decoded = JWT.decode(token, req.jwtTokenSecret)

  // 解析错误
  if (!userId || !decoded || !decoded.user_id) {
    res.send({ success: false })
    return
  }

  // 判断 token 是否有效
  Token.findOne(
    { user_id: decoded.user_id, token: token },
    {},
    {},
    function(err, result){

      if (err) console.log(err)

      if (!result ||
        result.user_id + '' != userId ||
        result.exchange_count != 0
        // result.ip != ip && result.exchange_count != 0 ||
        // result.ip == ip && result.exchange_count > 3
      ) {
        res.send({ success: false })
        return
      }

      res.send({
        success: true
      })
    }
  )

}
*/

exports.exchange = function(req, res, next) {

  var ip = Tools.getIP(req);
  var token = String(req.headers.accesstoken || req.body.access_token || '');

  if (!token || token == 'undefined') {
    res.send({
      success: false
    })
    return
  }

  let decoded = JWT.decode(token, req.jwtTokenSecret)

  // 解析错误
  if (!decoded || !decoded.user_id) {
    res.send({ success: false })
    return
  }

  // 判断 token 是否有效
  Token.findOne(
    { user_id: decoded.user_id, token: token },
    {},
    {
      populate: {
        path: 'user_id'
      }
    },
    function(err, result){
    if (err) console.log(err);

    // console.log(result);

    // 满足条件后，可以兑换，如果是同一个ip，可以兑换多次
    if (result && result.exchange_count == 0
      // result && result.exchange_count <= 3 && result.ip == ip
    ) {

      Token.update({ _id: result._id }, { exchange_count: result.exchange_count+1 }, (err)=>{
        if (err) console.log(err);
        let token = JWT.encode(req.jwtTokenSecret, decoded.user_id, result.user_id.accessToken, ip);
        res.send({
          success: true,
          data: token
        })
      })
    } else {
      // 兑换token异常，清除改用户所有的token，使其重新登录
      Token.remove({ user_id: decoded.user_id }, (err)=>{
        if (err) console.log(err);
        res.send({
          success: false
        })
      })

    }
  })

}
