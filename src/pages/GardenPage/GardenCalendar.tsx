import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

interface GardenCalendarProps {
  open: boolean
  onClose: () => void
  markedDates: Set<string>
  vlogCountByDate: Map<string, number>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  focusDate?: string | null
}

export function GardenCalendar({
  open,
  onClose,
  markedDates,
  vlogCountByDate,
  selectedDate,
  onSelectDate,
  focusDate,
}: GardenCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    if (focusDate) return parseDateKey(focusDate)
    if (selectedDate) return parseDateKey(selectedDate)
    return new Date(2026, 4, 1)
  })

  useEffect(() => {
    if (!open) return
    if (focusDate) {
      setViewMonth(parseDateKey(focusDate))
      return
    }
    if (selectedDate) {
      setViewMonth(parseDateKey(selectedDate))
    }
  }, [open, focusDate, selectedDate])

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const grid: Array<{ day: number; dateKey: string } | null> = []

    for (let i = 0; i < firstWeekday; i++) grid.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({ day, dateKey: toDateKey(year, month, day) })
    }

    return grid
  }, [viewMonth])

  if (!open) return null

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garden-calendar-title"
      onClick={onClose}
    >
      <article
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-primary">按日期浏览</p>
            <h2 id="garden-calendar-title" className="text-lg font-bold text-text">
              回忆日历
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg"
            aria-label="关闭日历"
          >
            <X size={18} />
          </button>
        </header>

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg"
            aria-label="上个月"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="text-base font-semibold text-text">{formatMonthTitle(viewMonth)}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg"
            aria-label="下个月"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-text-muted">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-1">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span key={`empty-${index}`} className="aspect-square" />
            }

            const hasVlog = markedDates.has(cell.dateKey)
            const count = vlogCountByDate.get(cell.dateKey) ?? 0
            const isSelected = selectedDate === cell.dateKey

            return (
              <button
                key={cell.dateKey}
                type="button"
                disabled={!hasVlog}
                onClick={() => {
                  onSelectDate(cell.dateKey)
                  onClose()
                }}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                    : hasVlog
                      ? 'bg-primary/12 text-primary hover:bg-primary/20'
                      : 'text-text-muted'
                } ${!hasVlog ? 'cursor-default opacity-45' : ''}`}
                aria-label={
                  hasVlog
                    ? `${cell.day}日，${count} 支 vlog`
                    : `${cell.day}日，暂无 vlog`
                }
              >
                <span>{cell.day}</span>
                {hasVlog && !isSelected && (
                  <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
                {count > 1 && (
                  <span
                    className={`absolute right-1 top-1 min-w-[14px] rounded-full px-1 text-[9px] leading-4 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-accent text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-primary/15 ring-1 ring-primary/30" />
            有 vlog
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-primary" />
            已选日期
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            当日标记
          </span>
        </div>
      </article>
    </div>
  )
}
