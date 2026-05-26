import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { checkBackendHealth, generateVlogFromClips } from '@/api/vlogGenerate'
import { AiGenerationStudio } from '@/components/AiGenerationStudio/AiGenerationStudio'
import { LAST_COMPLETE_FLOW_KEY } from '@/constants/projectFlow'
import { AI_GENERATION_STEPS } from '@/data/aiGenerationSteps'
import type { VlogGenerateManifest } from '@/types/vlogGenerate'
import { VLOG_GENERATE_RESULT_KEY } from '@/types/vlogGenerate'
import type { ClipForUpload } from '@/utils/vlogMaterialStore'
import { hasDirectorSession } from '@/utils/vlogDirectorStore'

interface GenerateLocationState {
  clips: ClipForUpload[]
  manifest: VlogGenerateManifest
}

const STEP_MS = 2400

export function VlogGeneratePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as GenerateLocationState | null
  const started = useRef(false)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(4)
  const [elapsedSec, setElapsedSec] = useState(0)
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current)
      if (elapsedTimer.current) clearInterval(elapsedTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!state?.clips?.length) {
      navigate(hasDirectorSession() ? '/vlog-learn' : '/ai-director/theme', { replace: true })
      return
    }
    if (started.current) return
    started.current = true

    const advanceVisual = () => {
      stepTimer.current = setInterval(() => {
        setActiveStep((s) => {
          const next = Math.min(s + 1, AI_GENERATION_STEPS.length - 1)
          setProgress((p) => Math.min(94, p + 10))
          return next
        })
      }, STEP_MS)
    }

    const run = async () => {
      const t0 = Date.now()
      elapsedTimer.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - t0) / 1000))
      }, 1000)

      try {
        setActiveStep(0)
        setProgress(8)

        const healthy = await checkBackendHealth()
        if (!healthy) {
          throw new Error(
            '连不上后端 API。请开两个终端：① cd backend && npm run dev  ② 在项目根目录 npm run dev',
          )
        }

        setActiveStep(1)
        setProgress(18)
        advanceVisual()

        const result = await generateVlogFromClips(state.clips, state.manifest)

        if (stepTimer.current) clearInterval(stepTimer.current)
        if (elapsedTimer.current) clearInterval(elapsedTimer.current)
        setActiveStep(AI_GENERATION_STEPS.length - 1)
        setProgress(100)

        sessionStorage.setItem(VLOG_GENERATE_RESULT_KEY, JSON.stringify(result))
        sessionStorage.setItem(LAST_COMPLETE_FLOW_KEY, 'director')
        sessionStorage.setItem(
          'memento-vlog-generate-manifest',
          JSON.stringify(state.manifest),
        )

        await new Promise((r) => setTimeout(r, 600))
        navigate('/complete', {
          replace: true,
          state: { flow: 'director', fromGenerate: true },
        })
      } catch (e) {
        if (stepTimer.current) clearInterval(stepTimer.current)
        if (elapsedTimer.current) clearInterval(elapsedTimer.current)
        setError(e instanceof Error ? e.message : '生成失败')
      }
    }

    void run()
  }, [state, navigate])

  return (
    <AiGenerationStudio
      activeStepIndex={activeStep}
      progress={progress}
      clipCount={state?.clips?.length ?? 0}
      elapsedSec={elapsedSec}
      error={error}
      onBack={() => navigate('/vlog-learn')}
    />
  )
}
