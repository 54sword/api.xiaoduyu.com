import socketIO from 'socket.io';

import * as JWT from '../utils/jwt';

// 总连接数
let connectCount = 0;
// 在线用户id
let onlineMember: Array<string> = [];
// 在线游客
let onlineVisitor: Array<string> = [];

let io: any;

export default (server: object) => {

  io = socketIO.listen(server);
  // io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
  // io.set('origins', 'http://127.0.0.1:4000');

  // 广播在线用户
  const updateOnline = () => {
    io.sockets.emit("online-user", {
      // 连接数
      connect: connectCount,
      // 在线会员
      member: Array.from(new Set([...onlineMember])).length,
      // 在线游客
      visitor: Array.from(new Set([...onlineVisitor])).length
    });
  }

  io.on('connection', function(socket: any){

    // 获取客户端用户的id
    const { accessToken } = socket.handshake.query;

    // 解码JWT获取用户的id
    let res = JWT.decode(accessToken);
    const userId = res && res.user_id ? res.user_id : '';

    // 获取客户端ip
    let address = socket.handshake.address;
    address = address.replace(/^.*:/, '');
    
    if (userId) {
      onlineMember.push(userId);
    } else {
      onlineVisitor.push(address);
    }
    connectCount += 1;

    updateOnline();

    socket.on('disconnect', function(res: any){

      connectCount -= 1;

      if (userId) {
        onlineMember.some((id, index)=>{
          if (id == userId) {
            onlineMember.splice(index, 1);
            return true;
          }
          return false;
        });
      } else {
        onlineVisitor.some((ip, index)=>{
          if (ip == address) {
            onlineVisitor.splice(index, 1);
            return true;
          }
          return false;
        });
      }

      updateOnline();

    });

  });

  global.io = io;

}

export const getSocket = () => {
  return io;
}
