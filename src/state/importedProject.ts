import type { VideoClip } from '@/data/mockProject'
import type { ProjectFlow } from '@/constants/projectFlow'

export interface EditorProject {
  clips: VideoClip[]
  duration: number
  flow: ProjectFlow
}

let activeProject: EditorProject | null = null
const revokedUrls = new Set<string>()

export function setStudioEditorProject(
  project: Omit<EditorProject, 'flow'>,
) {
  setEditorProject({ ...project, flow: 'studio' })
}

export function setEditorProject(project: EditorProject) {
  revokeEditorProject()
  activeProject = project
}

/** 更新工程（如追加片段），仅释放不再使用的 blob URL */
export function updateEditorProject(
  patch: Pick<EditorProject, 'clips' | 'duration'>,
) {
  if (!activeProject) return

  const project: EditorProject = {
    ...activeProject,
    ...patch,
  }

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

  activeProject = project
}

export function getEditorProject(): EditorProject | null {
  return activeProject
}

export function hasEditorProject(): boolean {
  return !!(activeProject && activeProject.clips.length)
}

export function hasStudioEditorProject(): boolean {
  return !!(
    activeProject &&
    activeProject.flow === 'studio' &&
    activeProject.clips.length
  )
}

export function getEditorProjectFlow(): ProjectFlow | null {
  return activeProject?.flow ?? null
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
