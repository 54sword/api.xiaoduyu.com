
interface Porps {
  ioSockets: any,
  socket: any,
  Models: any 
}

let roomList: any = {};

// socket room 广播消息
export default function({ ioSockets, socket, Models }: Porps) {
  socket.on('message', function({ target, data }: { target: string, data?: any }){
    ioSockets.to(target).emit(target, data);

    if (data && data.type && data.type == 'text') {
      
      if (!roomList[target]) {
        roomList[target] = 0;
      }

      roomList[target] += 1;
      
      // Models.Live.update({
      //   query: { _id: target },
      //   update: { $inc: { talk_count: 1 } }
      // });
    }

  });

  return function() {
    
  }
}

export const getTalkCountByLiveId = function(liveId: string) {
  return roomList[liveId] || 0
}