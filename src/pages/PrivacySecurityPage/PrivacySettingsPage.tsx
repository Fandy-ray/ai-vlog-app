import { ArrowLeft, BarChart3, Image, ScanEye, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow'
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import {
  DEFAULT_PRIVACY_SETTINGS,
  loadPrivacySettings,
  savePrivacySettings,
  type PrivacySettings,
} from '@/utils/privacySettings'

export function PrivacySettingsPage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS)

  useEffect(() => {
    setSettings(loadPrivacySettings())
  }, [])

  const update = useCallback(
    (patch: Partial<PrivacySettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        savePrivacySettings(next)
        return next
      })
      show('已保存')
    },
    [show],
  )

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/settings/privacy')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">隐私设置</h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 space-y-5 px-4 pt-2">
        <SettingsSection title="相册与 AI">
          <SettingsToggleRow
            label="允许访问相册"
            hint="导入视频、选择头像等需读取本机相册或文件"
            icon={<Image size={18} />}
            checked={settings.albumAccessEnabled}
            onChange={(albumAccessEnabled) => update({ albumAccessEnabled })}
          />
          <SettingsToggleRow
            label="允许 AI 识图"
            hint="魔法涂鸦、画面分析等会将截图发送至 AI 服务"
            icon={<ScanEye size={18} />}
            checked={settings.aiVisionEnabled}
            onChange={(aiVisionEnabled) => update({ aiVisionEnabled })}
            borderTop
          />
        </SettingsSection>

        <SettingsSection title="数据与推荐">
          <SettingsToggleRow
            label="匿名使用统计"
            hint="帮助改进剪辑与 AI 功能体验，不含视频内容"
            icon={<BarChart3 size={18} />}
            checked={settings.analyticsEnabled}
            onChange={(analyticsEnabled) => update({ analyticsEnabled })}
          />
          <SettingsToggleRow
            label="个性化推荐"
            hint="根据使用习惯推荐主题与功能"
            icon={<Sparkles size={18} />}
            checked={settings.personalizedRecommendations}
            onChange={(personalizedRecommendations) =>
              update({ personalizedRecommendations })
            }
            borderTop
          />
        </SettingsSection>

        <SettingsSection title="协作">
          <SettingsToggleRow
            label="共同编辑显示昵称"
            hint="协作者在线列表中展示你的昵称"
            icon={<Users size={18} />}
            checked={settings.showNameInCollaboration}
            onChange={(showNameInCollaboration) =>
              update({ showNameInCollaboration })
            }
          />
        </SettingsSection>

        <SettingsSection title="账号与数据">
          <SettingsRow
            label="本地素材说明"
            hint="视频默认仅存于本机，关闭应用后仍保留在浏览器"
            showChevron={false}
          />
          <SettingsRow
            label="申请注销账号"
            hint="7 天冷静期内可撤销"
            borderTop
            onClick={() =>
              show('注销功能即将开放，可先通过帮助中心联系客服')
            }
          />
        </SettingsSection>
      </div>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
