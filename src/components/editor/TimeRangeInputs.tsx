import { useEffect, useState } from 'react'
import { formatTime, parseTimeInput } from '@/utils/formatTime'
import type { TimeRange } from '@/utils/timeRange'
import { normalizeTimeRange } from '@/utils/timeRange'

interface TimeRangeInputsProps {
  range: TimeRange
  videoDuration: number
  onChange: (range: TimeRange) => void
  disabled?: boolean
}

function TimeField({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string
  value: number
  disabled?: boolean
  onCommit: (seconds: number) => void
}) {
  const [text, setText] = useState(formatTime(value))
  const [fieldHint, setFieldHint] = useState('')

  useEffect(() => {
    setText(formatTime(value))
    setFieldHint('')
  }, [value])

  const handleBlur = () => {
    if (disabled) return
    const parsed = parseTimeInput(text)
    if (parsed === null) {
      setText(formatTime(value))
      setFieldHint('请使用 mm:ss 格式，例如 01:30')
      return
    }
    setFieldHint('')
    onCommit(parsed)
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-text-muted">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="00:00"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm tabular-nums text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
        aria-label={label}
      />
      {fieldHint ? (
        <p className="mt-1 text-[10px] leading-snug text-amber-600">{fieldHint}</p>
      ) : null}
    </label>
  )
}

export function TimeRangeInputs({
  range,
  videoDuration,
  onChange,
  disabled = false,
}: TimeRangeInputsProps) {
  const [hint, setHint] = useState('')

  const commit = (patch: Partial<TimeRange>) => {
    const { range: next, corrected } = normalizeTimeRange(
      { ...range, ...patch },
      videoDuration,
    )
    onChange(next)
    if (corrected) {
      setHint('已自动修正为合法范围（00:00 ~ 总时长，且开始 < 结束）')
    } else {
      setHint('')
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <TimeField
          label="开始时间"
          value={range.startTime}
          disabled={disabled}
          onCommit={(startTime) => commit({ startTime })}
        />
        <TimeField
          label="结束时间"
          value={range.endTime}
          disabled={disabled}
          onCommit={(endTime) => commit({ endTime })}
        />
      </div>
      {hint ? (
        <p className="mt-1.5 text-[10px] leading-snug text-amber-600">{hint}</p>
      ) : (
        <p className="mt-1.5 text-[10px] text-text-muted">
          格式 mm:ss，总时长 {formatTime(videoDuration)}，开始须小于结束
        </p>
      )}
    </div>
  )
}
