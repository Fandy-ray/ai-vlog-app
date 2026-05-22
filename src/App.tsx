import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CompletePage } from '@/pages/CompletePage'
import { CreatePage } from '@/pages/CreatePage'
import { EditorPage } from '@/pages/EditorPage'
import { HomePage } from '@/pages/HomePage'
import { AiDirectorPlanPage } from '@/pages/AiDirectorPlanPage'
import { AiDirectorStylePage } from '@/pages/AiDirectorStylePage'
import { AiDirectorThemePage } from '@/pages/AiDirectorThemePage'
import { VlogLearnPage } from '@/pages/VlogLearnPage'
import { VlogGeneratePage } from '@/pages/VlogGeneratePage'
import { VlogMaterialsPage } from '@/pages/VlogMaterialsPage'
import { VlogShootPage } from '@/pages/VlogShootPage'
import { VideoTrimHost } from '@/components/VideoTrimHost'

export default function App() {
  return (
    <BrowserRouter>
      <VideoTrimHost />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/ai-director/theme" element={<AiDirectorThemePage />} />
        <Route path="/ai-director/style" element={<AiDirectorStylePage />} />
        <Route path="/ai-director/plan" element={<AiDirectorPlanPage />} />
        <Route path="/vlog-learn" element={<VlogLearnPage />} />
        <Route path="/vlog-learn/materials" element={<VlogMaterialsPage />} />
        <Route path="/vlog-learn/shoot/:sceneId" element={<VlogShootPage />} />
        <Route path="/vlog-learn/generate" element={<VlogGeneratePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
