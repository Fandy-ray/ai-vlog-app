const { WebSocketServer } = require('ws')
const { randomUUID } = require('crypto')
const store = require('../services/collaborationStore')

function attachCollaborationWs(server) {
  const wss = new WebSocketServer({ server, path: '/ws/collab' })

  wss.on('connection', (ws) => {
    let clientId = randomUUID()
    let roomId = null

    ws.on('message', (raw) => {
      let message
      try {
        message = JSON.parse(String(raw))
      } catch {
        return
      }

      if (message.type === 'join') {
        const nextRoomId = message.roomId
        const room = store.getRoom(nextRoomId)
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: '房间不存在' }))
          return
        }
        if (!room.enabled && message.userId !== room.ownerId) {
          ws.send(JSON.stringify({ type: 'error', message: '创建者已关闭共同编辑' }))
          return
        }

        if (roomId) {
          store.removeClient(roomId, clientId)
        }
        roomId = nextRoomId
        clientId = randomUUID()
        store.addClient(roomId, clientId, {
          userId: message.userId,
          userName: message.userName || '协作者',
        }, ws)

        ws.send(JSON.stringify({
          type: 'joined',
          roomId,
          clientId,
          revision: room.revision,
          snapshot: room.snapshot,
          enabled: room.enabled,
          presence: store.listPresence(store.getRoom(roomId)),
        }))

        store.broadcast(store.getRoom(roomId), {
          type: 'presence',
          users: store.listPresence(store.getRoom(roomId)),
        }, clientId)
        return
      }

      if (!roomId) return
      const room = store.getRoom(roomId)
      if (!room) return

      if (message.type === 'snapshot') {
        if (!room.enabled && message.userId !== room.ownerId) return
        const updated = store.updateRoomSnapshot(roomId, message.snapshot, message.userId)
        store.broadcast(room, {
          type: 'snapshot',
          revision: updated.revision,
          snapshot: updated.snapshot,
          clientId: message.clientId,
          userId: message.userId,
          userName: message.userName,
        }, message.clientId)
      }
    })

    ws.on('close', () => {
      if (!roomId) return
      const room = store.removeClient(roomId, clientId)
      if (room) {
        store.broadcast(room, {
          type: 'presence',
          users: store.listPresence(room),
        })
      }
    })
  })

  return wss
}

function notifyRoomStatus(roomId, enabled) {
  const room = store.getRoom(roomId)
  if (!room) return
  store.broadcast(room, { type: 'room_status', enabled })
  if (!enabled) {
    store.broadcast(room, { type: 'room_closed' })
  }
}

module.exports = {
  attachCollaborationWs,
  notifyRoomStatus,
}
