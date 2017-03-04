
// 上传文件模块
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

// 图像处理模块
var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick : true });
var mkdirs = require('../../common/mkdirs');

var User = require('../../models').User;
// var auth = require('../middlewares/auth');

var config = require('../../../configs/config');

var avatarPath = config.upload.avatar.path;

var getImageSuffix = function(fileType) {
  return {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif'
  }[fileType] || '';
};

var getAvatarPath = function(date) {

  var date = new Date(date);
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();

  month = month >= 10 ? month : '0'+month;
  day = day >= 10 ? day : '0'+day;

  return avatarPath + year + '/' + month + '/' + day + '/';
};

// 上传头像
exports.upload = function(req, res) {

  var user = req.user;
  var form = new formidable.IncomingForm('file');
  var meg = { err: 0 };

  User.fetchById(user._id, function(err, user){

    form.parse(req, function(err, fields, files) {

      var file = files.file;

      var imageType = {
        'image/jpeg': 1,
        'image/jpg': 1,
        'image/png': 1,
        'image/gif': 1
      };

      if (file.size > 1024*1024*5) {
        res.status(400);
        res.send({
          success: false,
          error_data: { size: '5M' },
          error: 13021
        });
        return;
      } else if (!imageType[file.type]) {
        res.status(400);
        res.send({
          success: false,
          error: 13022
        });
        return;
      }

      var suffix = getImageSuffix(file.type);

      // 获取头像存放路径
      var path = getAvatarPath(user.create_at);

      mkdirs(path, 0755, function(){

        // 临时
        var temporary = path + user._id + "_temporary."+suffix;
        // 原文件
        var original = path + user._id +'_original.jpg';

        fs.renameSync(file.path, temporary);

        if (suffix === 'gif') {

          // gif 图片需要处理成jpg以后处理
          imageMagick(temporary+'[0]').autoOrient().write(original, function(err){

            if (err) console.log(err);

            // 删除原始的gif图片
            fs.unlink(temporary, function(err){

              if (err) console.log(err);

              /*
              meg.err = '';
              meg.avatarPath = original.replace('public', "");
              res.send(meg);
              */

              res.send({
                success: true,
                data: config.domain + original.replace('public', "")
              });

            });

          });

        } else {

          imageMagick(temporary).autoOrient().write(original, function(err){

            fs.unlink(temporary, function(err){

              // meg.err = '';
              // meg.avatarPath = original.replace('public', "");
              // res.send(meg);

              res.send({
                success: true,
                data: config.domain + original.replace('public', "")
              });

            });

          });

        }

      });

    });

  });

};


var cropAvatar = function(req, x, y, width, height, user, callback) {

  var path = getAvatarPath(user.create_at);

  // 文件夹不存在，那么创建文件夹
  mkdirs(path, 0755, function(){

    // 原始图片
    var original = path + user._id + '_original.jpg';
    // 裁剪后的图片
    var source = path + user._id + '_large.jpg';

    imageMagick(original).autoOrient().crop(width, height, x, y).write(source, function(err){

      if (err) console.log(err);

      imageMagick(source).autoOrient().resize(400).quality(90).write(path+user._id+'_large.jpg', function(err){
        if (err) console.log(err);

        imageMagick(source).autoOrient().resize(128).quality(90).write(path+user._id+'_middle.jpg', function(err){
          if (err) console.log(err);

          imageMagick(source).autoOrient().resize(50).quality(97).write(path+user._id+'_thumbnail.jpg', function(err){
            if (err) console.log(err);

            User.updateAvatarById(user._id, true, function(err){
              if (err) console.log(err);

              callback()
              // auth.updateSessionByUserId(req, user._id, callback);

            });

            // 删除源图片
            fs.unlink(original, function(err){});

          });

        });

      });

    });

  });

};

exports.cropAvatar = cropAvatar;


// 裁剪切图
exports.crop = function(req, res, next) {

  var user = req.user;
  var x = req.body.x;
  var y = req.body.y;
  var width = req.body.width;
  var height = req.body.height;

  cropAvatar(req, x, y, width, height, user, function(){
    res.send({
      success: true
    });
  });

};
