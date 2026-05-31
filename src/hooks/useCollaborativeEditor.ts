import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildCollaborationJoinUrl,
  closeCollaborationRoom,
  createCollaborationRoom,
  fetchCollaborationRoomByCode,
  getCollaborationWsUrl,
  updateCollaborationRoom,
} from '@/api/collaboration'
import type {
  CollaborativeConnectionState,
  CollaborativeEditorState,
  CollaborativeRoomInfo,
  CollaborativeUser,
  CollaborativeWsMessage,
} from '@/types/collaborative'
import type { EditorSnapshot } from '@/types/editorState'
import { mergeRemoteSnapshot, serializeSnapshotForCollab } from '@/utils/collaborativeSnapshot'

const GUEST_ID_KEY = 'memento-collab-guest-id'

export function getCollaborativeUserId(userId?: string | null) {
  if (userId) return userId
  try {
    const existing = sessionStorage.getItem(GUEST_ID_KEY)
    if (existing) return existing
    const next = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem(GUEST_ID_KEY, next)
    return next
  } catch {
    return `guest_${Date.now()}`
  }
}

interface UseCollaborativeEditorOptions {
  snapshot: EditorSnapshot
  clips: import('@/data/mockProject').VideoClip[]
  userId: string
  userName: string
  onRemoteSnapshot: (snapshot: EditorSnapshot) => void
}

export function useCollaborativeEditor({
  snapshot,
  clips,
  userId,
  userName,
  onRemoteSnapshot,
}: UseCollaborativeEditorOptions) {
  const [state, setState] = useState<CollaborativeEditorState>({
    active: false,
    isOwner: false,
    enabled: false,
    room: null,
    presence: [],
    connectionState: 'idle',
    error: null,
  })
  const [sheetOpen, setSheetOpen] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const clientIdRef = useRef<string | null>(null)
  const roomRef = useRef<CollaborativeRoomInfo | null>(null)
  const applyingRemoteRef = useRef(false)
  const syncTimerRef = useRef<number | null>(null)
  const snapshotRef = useRef(snapshot)
  snapshotRef.current = snapshot
  const clipsRef = useRef(clips)
  clipsRef.current = clips
  const isOwnerRef = useRef(false)

  const disconnect = useCallback(() => {
    if (syncTimerRef.current != null) {
      window.clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
    }
    wsRef.current?.close()
    wsRef.current = null
    clientIdRef.current = null
    roomRef.current = null
  }, [])

  const connectRoom = useCallback(
  (room: CollaborativeRoomInfo, role: 'owner' | 'collaborator') => {
    disconnect()
    setState((prev) => ({
      ...prev,
      active: true,
      isOwner: role === 'owner',
      enabled: room.enabled,
      room,
      connectionState: 'connecting',
      error: null,
    }))
    isOwnerRef.current = role === 'owner'
    roomRef.current = room

    const ws = new WebSocket(getCollaborationWsUrl())
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          roomId: room.roomId,
          userId,
          userName,
        }),
      )
    }

    ws.onmessage = (event) => {
      let message: CollaborativeWsMessage & { type: string; clientId?: string; message?: string }
      try {
        message = JSON.parse(String(event.data))
      } catch {
        return
      }

      if (message.type === 'error') {
        setState((prev) => ({
          ...prev,
          connectionState: 'error',
          error: message.message || '连接失败',
        }))
        return
      }

      if (message.type === 'joined') {
        const joined = message as CollaborativeWsMessage & {
          clientId: string
          snapshot: EditorSnapshot
          enabled: boolean
          presence: CollaborativeUser[]
        }
        clientIdRef.current = joined.clientId
        applyingRemoteRef.current = true
        onRemoteSnapshot(
          mergeRemoteSnapshot(clipsRef.current, joined.snapshot),
        )
        applyingRemoteRef.current = false
        setState((prev) => ({
          ...prev,
          connectionState: 'connected',
          enabled: Boolean(joined.enabled),
          presence: joined.presence ?? prev.presence,
        }))
        return
      }

      if (message.type === 'presence') {
        setState((prev) => ({
          ...prev,
          presence: message.users,
        }))
        return
      }

      if (message.type === 'room_status') {
        setState((prev) => ({
          ...prev,
          enabled: message.enabled,
          error: message.enabled ? null : '创建者已关闭共同编辑',
        }))
        return
      }

      if (message.type === 'room_closed') {
        if (!isOwnerRef.current) {
          disconnect()
          isOwnerRef.current = false
          setState({
            active: false,
            isOwner: false,
            enabled: false,
            room: null,
            presence: [],
            connectionState: 'idle',
            error: '共同编辑已结束',
          })
        }
        return
      }

      if (message.type === 'snapshot' && message.clientId !== clientIdRef.current) {
        applyingRemoteRef.current = true
        onRemoteSnapshot(
          mergeRemoteSnapshot(clipsRef.current, message.snapshot),
        )
        applyingRemoteRef.current = false
      }
    }

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        connectionState: 'error',
        error: '协作连接异常，请确认后端已启动',
      }))
    }

    ws.onclose = () => {
      setState((prev) =>
        prev.active
          ? { ...prev, connectionState: 'error', error: prev.error || '连接已断开' }
          : prev,
      )
    }
  },
  [disconnect, onRemoteSnapshot, userId, userName],
)

  const broadcastSnapshot = useCallback((nextSnapshot: EditorSnapshot) => {
    const ws = wsRef.current
    const clientId = clientIdRef.current
    const room = roomRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN || !clientId || !room) return
    if (!room.enabled && !isOwnerRef.current) return
    ws.send(
      JSON.stringify({
        type: 'snapshot',
        snapshot: serializeSnapshotForCollab(nextSnapshot),
        clientId,
        userId,
        userName,
      }),
    )
  }, [userId, userName])

  const snapshotWithClips = useCallback((): EditorSnapshot => {
    const currentClips = clipsRef.current
    const duration =
      currentClips.reduce((sum, clip) => sum + clip.duration, 0) ||
      snapshotRef.current.videoDuration ||
      1
    return {
      ...snapshotRef.current,
      videoClips: currentClips,
      videoDuration: duration,
    }
  }, [])

  useEffect(() => {
    if (!state.active || applyingRemoteRef.current) return
    if (syncTimerRef.current != null) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => {
      broadcastSnapshot(snapshotWithClips())
    }, 450)
    return () => {
      if (syncTimerRef.current != null) window.clearTimeout(syncTimerRef.current)
    }
  }, [snapshot, clips, state.active, broadcastSnapshot, snapshotWithClips])

  const enableCollaboration = useCallback(async () => {
    const payload = serializeSnapshotForCollab(snapshotWithClips())
    const { room } = await createCollaborationRoom({
      ownerId: userId,
      ownerName: userName,
      title: payload.title,
      snapshot: payload,
    })
    connectRoom(room, 'owner')
  }, [connectRoom, snapshotWithClips, userId, userName])

  const setCollaborationEnabled = useCallback(
    async (enabled: boolean) => {
      const room = roomRef.current
      if (!room) return
      const { room: nextRoom } = await updateCollaborationRoom(room.roomId, {
        ownerId: userId,
        enabled,
        snapshot: enabled
          ? serializeSnapshotForCollab(snapshotWithClips())
          : undefined,
      })
      roomRef.current = nextRoom
      setState((prev) => ({
        ...prev,
        enabled: nextRoom.enabled,
        room: nextRoom,
        error: enabled ? null : prev.error,
      }))
    },
    [snapshotWithClips, userId],
  )

  const joinWithCode = useCallback(
    async (code: string) => {
      const { room, canJoin } = await fetchCollaborationRoomByCode(
        code.trim().toUpperCase(),
      )
      if (!canJoin) throw new Error('创建者已关闭共同编辑')
      connectRoom(room, 'collaborator')
    },
    [connectRoom],
  )

  const leaveCollaboration = useCallback(async () => {
    isOwnerRef.current = false
    disconnect()
    setState({
      active: false,
      isOwner: false,
      enabled: false,
      room: null,
      presence: [],
      connectionState: 'idle',
      error: null,
    })
  }, [disconnect])

  const closeCollaboration = useCallback(async () => {
    const room = roomRef.current
    if (room) {
      await closeCollaborationRoom(room.roomId, userId)
    }
    await leaveCollaboration()
  }, [leaveCollaboration, userId])

  useEffect(() => () => disconnect(), [disconnect])

  return {
    ...state,
    sheetOpen,
    setSheetOpen,
    enableCollaboration,
    setCollaborationEnabled,
    joinWithCode,
    leaveCollaboration,
    closeCollaboration,
    buildJoinUrl: (code: string) => buildCollaborationJoinUrl(code),
  }
}
