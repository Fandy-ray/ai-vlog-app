import type { EditorSnapshot } from '@/types/editorState'

export interface CollaborativeRoomInfo {
  roomId: string
  inviteCode: string
  enabled: boolean
  ownerId: string
  ownerName: string
  title: string
  revision: number
}

export interface CollaborativeUser {
  userId: string
  userName: string
  role: 'owner' | 'collaborator'
}

export type CollaborativeConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'

export interface CollaborativeSnapshotMessage {
  type: 'snapshot'
  revision: number
  snapshot: EditorSnapshot
  clientId: string
  userId: string
  userName: string
}

export interface CollaborativePresenceMessage {
  type: 'presence'
  users: CollaborativeUser[]
}

export interface CollaborativeRoomStatusMessage {
  type: 'room_status'
  enabled: boolean
}

export interface CollaborativeRoomClosedMessage {
  type: 'room_closed'
}

export interface CollaborativeErrorMessage {
  type: 'error'
  message?: string
}

export interface CollaborativeJoinedMessage {
  type: 'joined'
  clientId: string
  snapshot: EditorSnapshot
  enabled: boolean
  presence: CollaborativeUser[]
}

export type CollaborativeWsMessage =
  | CollaborativeSnapshotMessage
  | CollaborativePresenceMessage
  | CollaborativeRoomStatusMessage
  | CollaborativeRoomClosedMessage
  | CollaborativeErrorMessage
  | CollaborativeJoinedMessage

export interface CollaborativeEditorState {
  /** 是否已加入协作会话（含创建者） */
  active: boolean
  /** 当前用户是否为房间创建者 */
  isOwner: boolean
  /** 房间是否开放给他人加入 */
  enabled: boolean
  room: CollaborativeRoomInfo | null
  presence: CollaborativeUser[]
  connectionState: CollaborativeConnectionState
  error: string | null
}
