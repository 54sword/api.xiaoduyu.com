
var fs = require('fs');
var path = require('path');

// 创建所有目录
var mkdirs = function(dirpath, mode, callback) {
  fs.exists(dirpath, function(exists) {
    if(exists) {
      callback();
    } else {
      //尝试创建父目录，然后再创建当前目录
      mkdirs(path.dirname(dirpath), mode, function(){
        fs.mkdir(dirpath, mode, function(err){
          if (err) console.log(err);
          callback();
        });
      });
    }
  });
};

module.exports = mkdirs;