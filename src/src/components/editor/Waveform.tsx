interface WaveformProps {
  data: number[]
  color: string
  height?: number
  opacity?: number
}

export function Waveform({ data, color, height = 32, opacity = 0.85 }: WaveformProps) {
  const width = data.length
  const path = data
    .map((v, i) => {
      const x = (i / (width - 1)) * 100
      const y = height - v * (height - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" opacity={opacity} />
      <path
        d={`${path} L100,${height} L0,${height} Z`}
        fill={color}
        opacity={opacity * 0.25}
      />
    </svg>
  )
}
