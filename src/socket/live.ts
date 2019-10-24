
type Props = {
  ioSockets: any,
  socket: any
  // 数据查询models
  Models: any
  // 登录用户的id
  userId: string
  ip: string
}

let roomList: any = {};
let viewList: any = {};

export default function({ ioSockets, socket, Models, userId, ip }: Props) {

  const { scenes, liveId } = socket.handshake.query;  

  // 直播相关
  socket.on('live', function({ type, liveId  }: { type?: string, liveId?: string }){

    if (!type || !liveId) return;

    switch(type) {

      // 开始直播
      case 'start':
        if (userId) {
          Models.Live.findOne({
            query: { user_id: userId }
          })
          .then(({ _id } : { _id: String })=>{
            if (!_id || _id + '' != liveId) return;
            roomList[liveId] = [];
            viewList[liveId] = 0;

            Models.Live.update({
              query: { user_id: userId },
              update: { status: true, last_time: new Date() }
            });
          })

          socket.join(liveId, ()=>{});

        }
        break;
        
      // 结束直播
      case 'end':
        if (userId) {
          Models.Live.findOne({
            query: { user_id: userId }
          })
          .then(({ _id } : { _id: String })=>{
            if (!_id || _id + '' != liveId) return;

            roomList[liveId] = [];
            viewList[liveId] = 0;

            Models.Live.update({
              query: { user_id: userId },
              update: { status: false, talk_count: 0 }
            });
          })

          socket.leave(liveId, ()=>{
          });
        }
        break;
      
      // 加入房间+1
      case 'join-room':  
        if (liveId) {

          if (!roomList[liveId]) roomList[liveId] = [];
          if (!viewList[liveId]) viewList[liveId] = 0;
          
          socket.join(liveId, ()=>{
            roomList[liveId].push(socket.id);
            viewList[liveId] = viewList[liveId] + 1;
          });

          // Models.Live.update({
          //   query: { _id: liveId },
          //   update: { $addToSet: { audience: ip }, $inc: { view_count: 1 } }
          // });
          // ioSockets.to(liveId).emit(liveId, { type: 'add-audience' });
          ioSockets.to(liveId).emit(liveId, { type: 'add-audience' });
          // ioSockets.emit(liveId, { type: 'add-audience' });
        }
        break;
      
      // 离开房间-1
      case 'leave-room':
        if (liveId) {

          socket.leave(liveId, ()=>{
            var index = roomList[liveId].indexOf(socket.id);
            if (index !== -1) {
              roomList[liveId].splice(index, 1);
            }
            // console.log(roomList);
          });

          // Models.Live.update({
          //   query: { _id: liveId },
          //   update: { $pull: { audience: ip } }
          // });
          ioSockets.emit(liveId, { type: 'remove-audience' });
        }
        break;
    }
    
  });

  socket.on('disconnecting', (reason: any) => {
    let rooms = Object.keys(socket.rooms);

    if (rooms.length >= 2) {
      let liveId = rooms[1];
      socket.leave(liveId, ()=>{
        var index = roomList[liveId].indexOf(socket.id);
        if (index !== -1) {
          roomList[liveId].splice(index, 1);
        }
        ioSockets.emit(liveId, { type: 'remove-audience' });
      });
    }

  });

  // socket disconnect handle function
  return function() {
    if (scenes == 'live' && userId && liveId) {
      Models.Live.update({
        query: { _id: liveId },
        update: { status: false, audience: [] }
      });
    }

  }

}

// 获取访问观众总数
export const getAudienceCountByLiveId = function(liveId: string) {
  return roomList[liveId] ? roomList[liveId].length : 0;
}

// 获取查看次数
export const getViewCountByLiveId = function(liveId: string) {
  return viewList[liveId] || 0;
}