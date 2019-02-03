import fs from 'fs'
import path from 'path'

// 创建所有目录
const mkdirs = function(dirpath: string, mode: number, callback: any) {
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
}

export default mkdirs;