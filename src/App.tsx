import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UserProvider } from '@/context/UserContext'
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
import { GardenPage } from '@/pages/GardenPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { HelpPage } from '@/pages/HelpPage/HelpPage'
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage'
import { AccountSettingsPage } from '@/pages/SettingsPage/AccountSettingsPage'
import {
  PrivacyPolicyPage,
  PrivacySecurityPage,
  PrivacySettingsPage,
} from '@/pages/PrivacySecurityPage'
import { DraftsPage } from '@/pages/DraftsPage/DraftsPage'
import { VideoTrimHost } from '@/components/VideoTrimHost'

export default function App() {
  return (
    <UserProvider>
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
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />
        <Route path="/settings/privacy" element={<PrivacySecurityPage />} />
        <Route path="/settings/privacy/policy" element={<PrivacyPolicyPage />} />
        <Route path="/settings/privacy/preferences" element={<PrivacySettingsPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}
