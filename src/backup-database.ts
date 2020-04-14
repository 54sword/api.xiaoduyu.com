// 备份数据库的脚本

var exec = require('child_process').exec;
import config from '../config';

function execute(cmd: any) {
  console.log('数据库正在备份中...，'+new Date());
  exec(cmd, {maxBuffer: 1024 * 1024 * 500}, function(error: any, stdout: any, stderr: any) {    
    if (error) {
      console.error(error);
      console.log('备份失败，'+new Date());
    } else {
      console.log(stdout);
      console.log('备份完成，'+new Date());
    }
  });
}

var mongo = config.mongodb;

let arr: Array<string> = [];

if (mongo.path) arr.push(mongo.path+'/bin/mongodump')
if (mongo.address) arr.push('-h '+mongo.address)
if (mongo.port) arr.push('--port '+mongo.port)
if (mongo.userName) arr.push('-u '+mongo.userName)
if (mongo.password) arr.push('-p '+mongo.password)
if (mongo.database) arr.push('-d '+mongo.database)
if (mongo.backupPath) arr.push('-o '+mongo.backupPath)


// 每24小时自动备份一次
let start = function(){
  setTimeout(()=>{
    if (!config.debug && mongo.path) {
      execute(arr.join(' '));
    }
    start();
  }, 1000 * 60 * 60 * 24);
}

if (mongo.path) {
  console.log(`
  ////////////////////////////////////////////////////
  // 数据库自动备份 ${config.debug ? '(debug环境下不执行备份)' : ''}
  // 功能描述：每隔24小时自动备份一次数据库
  // 备份命令：${arr.join(' ')}
  ////////////////////////////////////////////////////
  `)  
}

// console.log('////////////////////////////////////////////////////');
// console.log('已启动数据库自动备份定时器，每隔24小时将会自动备份一次数据');
// if (config.debug) console.log('debug环境下，不执行数据库备份');
// console.log(arr.join(' '));
// console.log('////////////////////////////////////////////////////');

start();

/*
// 数据库的恢复
const restore = () => {
  
  let arr = [];

  if (mongo.path) arr.push(mongo.path+'/bin/mongorestore')
  if (mongo.address) arr.push('-h '+mongo.address)
  if (mongo.port) arr.push('--port '+mongo.port)
  if (mongo.userName) arr.push('-u '+mongo.userName)
  if (mongo.password) arr.push('-p '+mongo.password)
  if (mongo.database && mongo.restorePath) arr.push('-d '+mongo.database + ' '+mongo.restorePath)
  
  console.log(arr.join(' '));
}
restore();
*/

