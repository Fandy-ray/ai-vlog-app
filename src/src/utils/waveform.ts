export function generateWaveform(length: number, seed = 1): number[] {
  const points: number[] = []
  for (let i = 0; i < length; i++) {
    const t = i / length
    const base =
      Math.sin(t * Math.PI * 8 + seed) * 0.35 +
      Math.sin(t * Math.PI * 22 + seed * 2) * 0.2 +
      Math.sin(t * Math.PI * 3 + seed * 0.5) * 0.25
    const envelope = Math.sin(t * Math.PI) * 0.9 + 0.1
    points.push(Math.abs(base * envelope))
  }
  return points
}
