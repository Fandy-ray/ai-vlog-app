const INITIAL_SESSION = {
  title: '旅行的意义',
  filterId: 'none',
  filterIntensity: 100,
  effectId: 'none',
  textOverlay: null,
  stickerOverlays: [],
  textPresetId: 'none',
  textContent: '',
  keepOriginalAudio: true,
  bgmId: 'sunny-day'
}

let editorProject = null
let editorSession = Object.assign({}, INITIAL_SESSION)
let exportedVideo = null

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function setEditorProject(project) {
  editorProject = project ? clone(project) : null
  return editorProject
}

function getEditorProject() {
  return editorProject ? clone(editorProject) : null
}

function hasEditorProject() {
  return !!(editorProject && editorProject.clips && editorProject.clips.length)
}

function resetEditorSession() {
  editorSession = clone(Object.assign({}, INITIAL_SESSION))
}

function getEditorSession() {
  return clone(editorSession)
}

function setEditorSession(patch = {}) {
  const next = Object.assign({}, editorSession, patch)
  if (patch.stickerOverlays) {
    next.stickerOverlays = clone(patch.stickerOverlays)
  }
  if (patch.textOverlay !== undefined) {
    next.textOverlay = patch.textOverlay ? clone(patch.textOverlay) : null
  }
  editorSession = next
  return editorSession
}

function setExportedVideo(payload) {
  exportedVideo = payload ? clone(payload) : null
  return exportedVideo
}

function getExportedVideo() {
  return exportedVideo ? clone(exportedVideo) : null
}

function buildClipsFromImports(items = []) {
  let start = 0
  const clips = items.map((item, index) => {
    const clip = {
      id: item.id || `clip-${index + 1}`,
      name: item.name ? item.name : `片段 ${index + 1}`,
      start,
      duration: item.duration || 5,
      thumb: item.thumb || item.uri,
      poster: item.thumb || item.uri,
      videoSrc: item.uri
    }
    start += clip.duration
    return clip
  })

  return {
    clips,
    duration: Math.max(start, 1)
  }
}

function getClipAtTime(clips = [], time = 0) {
  const list = clips.length ? clips : []
  let cursor = 0

  for (let i = 0; i < list.length; i += 1) {
    const clip = list[i]
    const end = cursor + clip.duration
    if (time < end || i === list.length - 1) {
      return {
        clip,
        index: i,
        localTime: Math.max(0, Math.min(time - cursor, clip.duration - 0.05))
      }
    }
    cursor = end
  }

  return { clip: list[0], index: 0, localTime: 0 }
}

export default {
  INITIAL_SESSION,
  setEditorProject,
  getEditorProject,
  hasEditorProject,
  resetEditorSession,
  getEditorSession,
  setEditorSession,
  setExportedVideo,
  getExportedVideo,
  buildClipsFromImports,
  getClipAtTime
}
