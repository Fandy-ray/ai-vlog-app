import type { VideoClip } from '@/data/mockProject'

export interface EditorProject {
  clips: VideoClip[]
  duration: number
}

let activeProject: EditorProject | null = null
const revokedUrls = new Set<string>()

export function setEditorProject(project: EditorProject) {
  revokeEditorProject()
  activeProject = project
}

/** 更新工程（如追加片段），仅释放不再使用的 blob URL */
export function updateEditorProject(project: EditorProject) {
  if (activeProject) {
    const nextUrls = new Set(
      project.clips
        .map((clip) => clip.videoSrc)
        .filter((src): src is string => !!src && src.startsWith('blob:')),
    )
    activeProject.clips.forEach((clip) => {
      const src = clip.videoSrc
      if (src && src.startsWith('blob:') && !nextUrls.has(src) && !revokedUrls.has(src)) {
        URL.revokeObjectURL(src)
        revokedUrls.add(src)
      }
    })
  }
  activeProject = project
}

export function getEditorProject(): EditorProject | null {
  return activeProject
}

export function hasEditorProject(): boolean {
  return !!(activeProject && activeProject.clips.length)
}

export function revokeEditorProject() {
  if (!activeProject) return

  activeProject.clips.forEach((clip) => {
    const src = clip.videoSrc
    if (src && src.startsWith('blob:') && !revokedUrls.has(src)) {
      URL.revokeObjectURL(src)
      revokedUrls.add(src)
    }
  })

  activeProject = null
}
