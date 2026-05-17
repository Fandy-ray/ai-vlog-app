import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CompletePage } from '@/pages/CompletePage'
import { EditorPage } from '@/pages/EditorPage'
import { HomePage } from '@/pages/HomePage'
import { VlogLearnPage } from '@/pages/VlogLearnPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vlog-learn" element={<VlogLearnPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
