
import { User, Captcha, Phone } from '../../models'
import async from 'async'
import Countries from '../../data/countries'

exports.reset = function(req, res, next) {

  var user = req.user
  var phone = req.body.phone
  var captcha = req.body.captcha
  var areaCode = req.body.area_code

  async.waterfall([

    function(callback) {

      // 判断区号是否有效
      let existAreaCode = false

      Countries.map(item=>{
        if (item.code == areaCode) existAreaCode = true
      })

      if (!phone || !captcha || !areaCode) {
        callback(10005)
      } else if (!existAreaCode) {
        callback(30004)
      } else {
        callback(null)
      }
    },

    function(callback) {
      Phone.findOne({
        query: { user_id: user._id },
        callback: (err, account) => {
          if (err) console.log(err)
          if (!account) {
            // 账号不存在
            callback(13000)
          } else {
            callback(null, account)
          }
        }
      })
    },

    function(account, callback) {

      Captcha.findOne({
        query: { user_id: user._id, phone, area_code: areaCode },
        options: { sort:{ create_at: -1 } },
        callback: (err, _captcha) => {
          if (err) console.log(err)
          if (_captcha && _captcha.captcha == captcha) {

            Phone.update({
              condition: { _id: account._id },
              contents: { phone, area_code: areaCode },
              callback: function(err){
                if (err) console.log(err)

                // 删除该用户所有的手机手机验证码
                Captcha.remove({ condition: { user_id: user._id, phone } })

                callback(null)
              }
            })

          } else {
            callback(13010);
          }
        }
      })

    }

  ], function(err, result){

    if (err) {
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    return res.send({ success: true })
  });

};

exports.binding = function(req, res, next) {

  var user = req.user;
  var phone = req.body.phone;
  var captcha = req.body.captcha;
  let areaCode = req.body.area_code;

  async.waterfall([

    (callback) => {

      // 判断区号是否有效
      let existAreaCode = false
      
      Countries.map(item=>{
        if (item.code == areaCode) existAreaCode = true
      })

      if (!phone || !captcha || !areaCode) {
        callback(10005)
      } else if (!existAreaCode) {
        callback(30004)
      } else {
        callback(null)
      }
    },

    // 验证码验证码是否正确
    function(callback) {
      Captcha.findOne({
        query: { user_id: user._id, phone, area_code: areaCode },
        options: { sort:{ create_at: -1 } },
        callback: (err, _captcha) => {
          if (_captcha && _captcha.captcha == captcha) {
            return callback(null)
          }
          callback(13010)
        }
      })
    },

    // 验证手机号是否存在
    function(callback) {

      Phone.findOne({
        query: { phone },
        callback: (err, acc) => {
          if (err) console.log(err);
          if (!acc) {
            callback(null)
          } else {
            callback(30002)
          }
        }
      })

    },

    function(callback) {

      Phone.save({
        data: {
          user_id: user._id,
          phone: phone,
          area_code: areaCode
        },
        callback: (err, acc) => {
          if (err) console.log(err)

          // 删除该用户所有的手机手机验证码
          Captcha.remove({ condition: { user_id: user._id, phone } })

          callback(null)
        }
      })

    }
  ], function(err, result){

    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    res.send({ success: true });

  })

}
