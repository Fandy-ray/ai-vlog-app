const { randomUUID } = require('crypto')

const rooms = new Map()
const codeIndex = new Map()

function randomInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  if (codeIndex.has(code)) return randomInviteCode()
  return code
}

function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot || {}))
}

function createRoom({ ownerId, ownerName, title, snapshot }) {
  const roomId = randomUUID()
  const inviteCode = randomInviteCode()
  const room = {
    roomId,
    inviteCode,
    enabled: true,
    ownerId,
    ownerName: ownerName || '创作者',
    title: title || '未命名项目',
    snapshot: cloneSnapshot(snapshot),
    revision: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    clients: new Map(),
  }
  rooms.set(roomId, room)
  codeIndex.set(inviteCode, roomId)
  return room
}

function getRoom(roomId) {
  return rooms.get(roomId) || null
}

function getRoomByCode(code) {
  const roomId = codeIndex.get(String(code || '').trim().toUpperCase())
  if (!roomId) return null
  return rooms.get(roomId) || null
}

function setRoomEnabled(roomId, enabled) {
  const room = rooms.get(roomId)
  if (!room) return null
  room.enabled = Boolean(enabled)
  room.updatedAt = Date.now()
  return room
}

function updateRoomSnapshot(roomId, snapshot, userId) {
  const room = rooms.get(roomId)
  if (!room) return null
  room.snapshot = cloneSnapshot(snapshot)
  room.revision += 1
  room.updatedAt = Date.now()
  room.lastEditorId = userId
  return room
}

function deleteRoom(roomId) {
  const room = rooms.get(roomId)
  if (!room) return false
  codeIndex.delete(room.inviteCode)
  rooms.delete(roomId)
  return true
}

function addClient(roomId, clientId, meta, ws) {
  const room = rooms.get(roomId)
  if (!room) return null
  room.clients.set(clientId, { ...meta, ws, joinedAt: Date.now() })
  return room
}

function removeClient(roomId, clientId) {
  const room = rooms.get(roomId)
  if (!room) return null
  room.clients.delete(clientId)
  return room
}

function listPresence(room) {
  if (!room) return []
  return [...room.clients.values()].map((client) => ({
    userId: client.userId,
    userName: client.userName,
    role: client.userId === room.ownerId ? 'owner' : 'collaborator',
  }))
}

function broadcast(room, payload, exceptClientId) {
  if (!room) return
  const data = JSON.stringify(payload)
  for (const [clientId, client] of room.clients.entries()) {
    if (clientId === exceptClientId) continue
    if (client.ws.readyState === 1) {
      client.ws.send(data)
    }
  }
}

module.exports = {
  createRoom,
  getRoom,
  getRoomByCode,
  setRoomEnabled,
  updateRoomSnapshot,
  deleteRoom,
  addClient,
  removeClient,
  listPresence,
  broadcast,
}
