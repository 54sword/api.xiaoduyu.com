import socketIO from 'socket.io';

import * as JWT from '../utils/jwt';

// 总连接数
let connectCount = 0,
    // 在线用户id
    onlineMember: Array<string> = [],
    // 在线游客
    onlineVisitor: Array<string> = [],
    io: any;

export default (server: any) => {

  io = socketIO.listen(server);
  // io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
  // io.set('origins', 'http://127.0.0.1:4000');
  
  // 广播在线用户
  const updateOnline = (sockets = io.sockets) => {
    sockets.emit('online-user', {
      // 连接数
      connect: connectCount,
      // 在线会员
      member: Array.from(new Set([...onlineMember])).length,
      // 在线游客
      visitor: Array.from(new Set([...onlineVisitor])).length
    });
  }

  let timer = function(){
    setTimeout(()=>{
      updateOnline();
      timer();
    }, 1000 * 60);
  }
  timer();

  io.on('connection', function(socket: any){

    // 获取客户端用户的id
    const { accessToken } = socket.handshake.query;

    let userId = '';
    
    if (accessToken) {
      // 解码JWT获取用户的id
      let res = JWT.decode(accessToken);
      userId = res && res.user_id ? res.user_id : '';
    }

    let address = '';

    try {
      address = socket.handshake.headers["x-real-ip"];
    } catch (err) {
      console.log(err);
      address = socket.handshake.address;
      address = address.replace(/^.*:/, '');
    }
    
    // 获取客户端ip
    // let address = socket.handshake.address;
    // console.log(address);
    // address = address.replace(/^.*:/, '');
    
    if (userId) {
      onlineMember.push(userId);
    } else {
      onlineVisitor.push(address);
    }
    connectCount += 1;

    // updateOnline();

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

      // updateOnline();

    });

    updateOnline(socket);

  });
}

export const emit = (target: string, params: object): void => {
  if (io) {
    io.sockets.emit(target, JSON.stringify(params))
  } 
}
