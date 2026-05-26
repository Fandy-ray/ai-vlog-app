import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/Button'
import { useUser } from '@/context/UserContext'
import { assertAlbumAccessAllowed } from '@/utils/privacySettings'

const MAX_AVATAR_BYTES = 512 * 1024

interface EditProfileSheetProps {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function EditProfileSheet({ open, onClose, onSaved }: EditProfileSheetProps) {
  const { user, updateProfile } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [nickname, setNickname] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    setNickname(user.nickname)
    setAvatarPreview(user.avatarUrl)
    setError('')
  }, [open, user])

  if (!open || !user) return null

  const pickAvatar = () => {
    try {
      assertAlbumAccessAllowed()
      fileRef.current?.click()
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法访问相册')
    }
  }

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('头像图片请小于 512KB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result)
        setError('')
      }
    }
    reader.onerror = () => setError('读取图片失败，请重试')
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('昵称不能为空')
      return
    }
    if (trimmed.length > 20) {
      setError('昵称最多 20 个字符')
      return
    }

    setSaving(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      updateProfile({
        nickname: trimmed,
        avatarUrl: avatarPreview,
      })
      onSaved?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={onClose}
    >
      <section
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="edit-profile-title" className="text-lg font-semibold text-text">
              编辑资料
            </h2>
            <p className="mt-1 text-xs text-text-muted">更换头像或修改昵称</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted hover:text-text"
            aria-label="关闭编辑"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={pickAvatar}
            className="group relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20"
            aria-label="更换头像"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary">
                {nickname.trim().slice(0, 1) || '忆'}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
              <Camera size={22} />
            </span>
          </button>
          <button
            type="button"
            onClick={pickAvatar}
            className="text-xs font-medium text-primary"
          >
            点击更换头像
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">昵称</span>
          <input
            type="text"
            maxLength={20}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="请输入昵称"
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </label>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" fullWidth onClick={onClose}>
            取消
          </Button>
          <Button fullWidth size="lg" disabled={saving} onClick={() => void handleSave()}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </section>
    </div>
  )
}
