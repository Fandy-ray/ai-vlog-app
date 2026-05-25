import { useEffect, useState } from 'react'
import { GARDEN_VLOGS, type GardenVlogItem } from '@/data/memories'
import {
  GARDEN_CHANGED,
  loadAllGardenVlogs,
  revokeGardenVlogUrls,
} from '@/utils/gardenStore'

export function useGardenVlogs() {
  const [vlogs, setVlogs] = useState<GardenVlogItem[]>(GARDEN_VLOGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active: GardenVlogItem[] = []

    const run = () => {
      setLoading(true)
      void loadAllGardenVlogs()
        .then((next) => {
          revokeGardenVlogUrls(active)
          active = next
          setVlogs(next)
        })
        .finally(() => setLoading(false))
    }

    run()
    window.addEventListener(GARDEN_CHANGED, run)
    return () => {
      window.removeEventListener(GARDEN_CHANGED, run)
      revokeGardenVlogUrls(active)
    }
  }, [])

  return { vlogs, loading }
}
