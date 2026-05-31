const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const store = require('../services/collaborationStore')
const { notifyRoomStatus } = require('../ws/collaborationWs')

const router = express.Router()

const collabUploadRoot = path.join(__dirname, '../../uploads/collab')
fs.mkdirSync(collabUploadRoot, { recursive: true })

const collabStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(collabUploadRoot, req.params.roomId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const rawId = String(req.body?.clipId || 'clip').replace(/[^\w-]/g, '')
    const ext = path.extname(file.originalname) || '.mp4'
    cb(null, `${rawId || 'clip'}${ext}`)
  },
})

const collabUpload = multer({
  storage: collabStorage,
  limits: { fileSize: 120 * 1024 * 1024 },
})

function removeCollabUploads(roomId) {
  const dir = path.join(collabUploadRoot, roomId)
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch {
    /* ignore cleanup errors */
  }
}

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

/** 上传协作视频片段（创建者同步给协作者） */
router.post('/collab/rooms/:roomId/clips', collabUpload.single('video'), (req, res) => {
  const room = store.getRoom(req.params.roomId)
  if (!room) {
    res.status(404).json({ code: 'room_not_found', message: '房间不存在' })
    return
  }
  if (!req.file) {
    res.status(400).json({ code: 'missing_file', message: '缺少视频文件' })
    return
  }

  const clipId =
    String(req.body?.clipId || path.basename(req.file.filename, path.extname(req.file.filename)))
  const uri = `/uploads/collab/${req.params.roomId}/${req.file.filename}`

  res.json({
    code: 0,
    data: {
      clipId,
      uri,
      size: req.file.size,
    },
  })
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
  removeCollabUploads(room.roomId)
  store.deleteRoom(room.roomId)
  res.json({ code: 0, data: { ok: true } })
})

module.exports = router
