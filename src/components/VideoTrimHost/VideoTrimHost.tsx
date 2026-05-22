import { useEffect, useState } from 'react'
import { VideoTrimModal } from '@/components/VideoTrimModal/VideoTrimModal'
import {
  registerVideoTrimListener,
  resolveVideoTrim,
  type VideoTrimRequest,
} from '@/utils/videoTrimFlow'

export function VideoTrimHost() {
  const [request, setRequest] = useState<VideoTrimRequest | null>(null)

  useEffect(() => {
    return registerVideoTrimListener((req) => setRequest(req))
  }, [])

  return (
    <VideoTrimModal
      request={request}
      onClose={(result) => {
        setRequest(null)
        resolveVideoTrim(result)
      }}
    />
  )
}
