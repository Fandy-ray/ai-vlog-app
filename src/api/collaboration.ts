import type { EditorSnapshot } from '@/types/editorState'
import type { CollaborativeRoomInfo } from '@/types/collaborative'

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json()
    return data.message || data.error || response.statusText
  } catch {
    return response.statusText
  }
}

export async function createCollaborationRoom(input: {
  ownerId: string
  ownerName: string
  title: string
  snapshot: EditorSnapshot
}): Promise<{ room: CollaborativeRoomInfo; snapshot: EditorSnapshot }> {
  const response = await fetch('/api/collab/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(await readErrorMessage(response))
  const data = await response.json()
  if (data.code !== 0) throw new Error(data.message || '创建协作房间失败')
  return data.data
}

export async function fetchCollaborationRoomByCode(code: string): Promise<{
  room: CollaborativeRoomInfo
  canJoin: boolean
  snapshot: EditorSnapshot
}> {
  const normalized = code.trim().toUpperCase()
  const response = await fetch(
    `/api/collab/rooms/code/${encodeURIComponent(normalized)}`,
  )
  if (!response.ok) throw new Error(await readErrorMessage(response))
  const data = await response.json()
  if (data.code !== 0) throw new Error(data.message || '查询邀请码失败')
  return data.data
}

export async function updateCollaborationRoom(
  roomId: string,
  input: {
    ownerId: string
    enabled?: boolean
    snapshot?: EditorSnapshot
  },
): Promise<{ room: CollaborativeRoomInfo; snapshot: EditorSnapshot }> {
  const response = await fetch(`/api/collab/rooms/${roomId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(await readErrorMessage(response))
  const data = await response.json()
  if (data.code !== 0) throw new Error(data.message || '更新协作房间失败')
  return data.data
}

export async function closeCollaborationRoom(roomId: string, ownerId: string) {
  const response = await fetch(`/api/collab/rooms/${roomId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId }),
  })
  if (!response.ok) throw new Error(await readErrorMessage(response))
  const data = await response.json()
  if (data.code !== 0) throw new Error(data.message || '关闭协作失败')
}

export function getCollaborationWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/collab`
}

export function buildCollaborationJoinUrl(inviteCode: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('collab', inviteCode)
  return url.toString()
}

export async function uploadCollabClip(
  roomId: string,
  clipId: string,
  blobUrl: string,
): Promise<{ clipId: string; uri: string }> {
  const response = await fetch(blobUrl)
  if (!response.ok) throw new Error('读取本地视频失败')
  const blob = await response.blob()
  const ext =
    blob.type.includes('mp4') || blob.type.includes('avc')
      ? 'mp4'
      : blob.type.includes('webm')
        ? 'webm'
        : blob.type.includes('quicktime')
          ? 'mov'
          : 'mp4'

  const form = new FormData()
  form.append('clipId', clipId)
  form.append('video', blob, `${clipId}.${ext}`)

  const uploadRes = await fetch(`/api/collab/rooms/${encodeURIComponent(roomId)}/clips`, {
    method: 'POST',
    body: form,
  })
  if (!uploadRes.ok) throw new Error(await readErrorMessage(uploadRes))
  const payload = await uploadRes.json()
  if (payload.code !== 0) throw new Error(payload.message || '上传协作视频失败')
  return payload.data
}
