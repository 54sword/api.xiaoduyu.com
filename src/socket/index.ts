import socketIO from 'socket.io';

import * as JWT from '@src/utils/jwt';
import live from './live';
import message from './message';

// 总连接数
let connectCount = 0,
    // 在线用户id
    onlineMember: Array<string> = [],
    // 在线游客
    onlineVisitor: Array<string> = [],
    io: any;

export default function(server: any, Models: any) {

  // io = socketIO(server);
  io = socketIO.listen(server);
  // io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
  // io.set('origins', 'http://127.0.0.1:4000');
  
  // 广播在线用户
  const updateOnline = (sockets = io.sockets) => {

    sockets.emit('all', {
      type: 'online-user',
      data: {
        // 连接数
        connect: connectCount,
        // 在线会员
        member: Array.from(new Set([...onlineMember])).length,
        // 在线游客
        visitor: Array.from(new Set([...onlineVisitor])).length
      }
    });
    /*
    sockets.emit('online-user', {
      // 连接数
      connect: connectCount,
      // 在线会员
      member: Array.from(new Set([...onlineMember])).length,
      // 在线游客
      visitor: Array.from(new Set([...onlineVisitor])).length
    });
    */
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
    const { accessToken, scenes, liveId } = socket.handshake.query;

    let userId = '';
    
    if (accessToken) {
      // 解码JWT获取用户的id
      let res = JWT.decode(accessToken);
      userId = res && res.user_id ? res.user_id : '';
    }

    // 获取客户端ip
    let address = socket.handshake.headers["x-real-ip"] || '';

    if (!address) {
      address = socket.handshake.address;
      address = address.replace(/^.*:/, '');
    }

    // try {
    //   address = socket.handshake.headers["x-real-ip"];
    // } catch (err) {
    //   console.log(err);
    //   address = socket.handshake.address;
    //   address = address.replace(/^.*:/, '');
    // }
    
    if (userId) {
      onlineMember.push(userId);
      // 加入自己的房间
      socket.join(userId, () => {});

    } else {
      onlineVisitor.push(address);
    }
    connectCount += 1;

    const liveDisconnect = live({ ioSockets: io.sockets, socket, Models, userId, ip: address });
    const messageDisconnect = message({ ioSockets: io.sockets, socket, Models });

    socket.on('disconnect', function(res: any){

      

      // console.log(socket.adapter.rooms);
      // console.log(socket.rooms);

      connectCount -= 1;

      if (userId) {
        // 离开自己的房间
        socket.leave(userId, () => {});

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

      liveDisconnect();
      messageDisconnect();

    });

    updateOnline(socket);

  });

}

export const emit = (target: string, params: object): void => {
  if (io) {
    io.sockets.emit(target, params);
  } 
}

// 发送给某个用户的房间
export const emitByUserId = (userId: string, target: string, params: object): boolean => {
  
  if (io) {
    // If the room is exist, then emit a message
    if (io.sockets.adapter.rooms[userId]) {
      io.sockets.to(userId).emit(target, params);
      return true;
    }
  }

  // Meit failed
  return false;
}