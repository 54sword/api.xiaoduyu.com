
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
            roomList[liveId] = 0;
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

            roomList[liveId] = 0;
            viewList[liveId] = 0;

            Models.Live.update({
              query: { user_id: userId },
              update: { status: false, talk_count: 0 }
            });
          })

          socket.leave(liveId, ()=>{});
        }
        break;
      
      // 加入房间+1
      case 'join-room':  
        if (liveId) {

          if (!roomList[liveId]) roomList[liveId] = 0;
          if (!viewList[liveId]) viewList[liveId] = 0;
          
          socket.join(liveId, ()=>{
            roomList[liveId] = roomList[liveId] + 1;
            viewList[liveId] = viewList[liveId] + 1;
            ioSockets.in(liveId).emit(liveId, { 
              type: 'live-info', 
              audience_count: getAudienceCountByLiveId(liveId),
              view_count: getViewCountByLiveId(liveId)
            });
          });
        }
        break;
      
      // 离开房间-1
      case 'leave-room':
        if (liveId) {

          socket.leave(liveId, ()=>{
            if (roomList[liveId]) {
              roomList[liveId] = roomList[liveId] - 1;
            }
            ioSockets.in(liveId).emit(liveId, {
              type: 'live-info', 
              audience_count: getAudienceCountByLiveId(liveId),
              view_count: getViewCountByLiveId(liveId)
            });
          });
        }
        break;
    }
    
  });
  
  socket.on('disconnecting', (reason: any) => {

    let rooms = Object.keys(socket.rooms);

    rooms.map(item=>{
      if (!roomList[item]) return;

      roomList[item] = roomList[item] - 1;
      socket.leave(item, ()=>{
        ioSockets.in(item).emit(item, {
          type: 'live-info', 
          audience_count: getAudienceCountByLiveId(item),
          view_count: getViewCountByLiveId(item)
        });
      });
    });

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
  return roomList[liveId] || 0;
}

// 获取查看次数
export const getViewCountByLiveId = function(liveId: string) {
  return viewList[liveId] || 0;
}