const express = require('express')
const store = require('../services/collaborationStore')
const { notifyRoomStatus } = require('../ws/collaborationWs')

const router = express.Router()

function roomPayload(room) {
  return {
    roomId: room.roomId,
    inviteCode: room.inviteCode,
    enabled: room.enabled,
    ownerId: room.ownerId,
    ownerName: room.ownerName,
    title: room.title,
    revision: room.revision,
  }
}

router.post('/collab/rooms', (req, res) => {
  const { ownerId, ownerName, title, snapshot } = req.body || {}
  if (!ownerId) {
    res.status(400).json({ code: 'missing_owner', message: '缺少用户标识' })
    return
  }
  const room = store.createRoom({
    ownerId,
    ownerName,
    title,
    snapshot,
  })
  res.json({ code: 0, data: { room: roomPayload(room), snapshot: room.snapshot } })
})

router.get('/collab/rooms/code/:code', (req, res) => {
  const room = store.getRoomByCode(req.params.code)
  if (!room) {
    res.status(404).json({ code: 'room_not_found', message: '邀请码无效或房间已关闭' })
    return
  }
  res.json({
    code: 0,
    data: {
      room: roomPayload(room),
      canJoin: room.enabled,
      snapshot: room.snapshot,
    },
  })
})

router.get('/collab/rooms/:roomId', (req, res) => {
  const room = store.getRoom(req.params.roomId)
  if (!room) {
    res.status(404).json({ code: 'room_not_found', message: '房间不存在' })
    return
  }
  res.json({
    code: 0,
    data: {
      room: roomPayload(room),
      snapshot: room.snapshot,
    },
  })
})

router.patch('/collab/rooms/:roomId', (req, res) => {
  const room = store.getRoom(req.params.roomId)
  if (!room) {
    res.status(404).json({ code: 'room_not_found', message: '房间不存在' })
    return
  }
  const { ownerId, enabled, snapshot } = req.body || {}
  if (ownerId !== room.ownerId) {
    res.status(403).json({ code: 'forbidden', message: '仅创建者可修改房间权限' })
    return
  }
  if (typeof enabled === 'boolean') {
    store.setRoomEnabled(room.roomId, enabled)
    notifyRoomStatus(room.roomId, enabled)
  }
  if (snapshot) {
    store.updateRoomSnapshot(room.roomId, snapshot, ownerId)
  }
  const next = store.getRoom(room.roomId)
  res.json({ code: 0, data: { room: roomPayload(next), snapshot: next.snapshot } })
})

router.delete('/collab/rooms/:roomId', (req, res) => {
  const room = store.getRoom(req.params.roomId)
  if (!room) {
    res.status(404).json({ code: 'room_not_found', message: '房间不存在' })
    return
  }
  const { ownerId } = req.body || {}
  if (ownerId !== room.ownerId) {
    res.status(403).json({ code: 'forbidden', message: '仅创建者可关闭协作' })
    return
  }
  notifyRoomStatus(room.roomId, false)
  store.deleteRoom(room.roomId)
  res.json({ code: 0, data: { ok: true } })
})

module.exports = router
