"use client"

import { useMultibandTrackVolume } from "@/common"
import { cn } from "@/lib/utils"
// import AudioVisualizer from "../audioVisualizer"
import { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import AudioVisualizer from "@/components/Agent/AudioVisualizer"

export interface AgentViewProps {
  audioTrack?: IMicrophoneAudioTrack
}

export default function AgentView(props: AgentViewProps) {
  const { audioTrack } = props

  const subscribedVolumes = useMultibandTrackVolume(audioTrack, 7)

  return (
    <div
      className={cn(
        "flex h-[300px] w-full flex-col items-center justify-center px-4",
      )}
      style={{
        background: "linear-gradient(135deg, #E5173F 0%, #8E0E0E 100%)"
      }}
    >
      <div className="mb-8 text-2xl font-bold text-white text-center">Agent</div>
      <div className="flex items-center justify-center w-full">
        <AudioVisualizer
          type="agent"
          frequencies={subscribedVolumes}
          barWidth={10}
          minBarHeight={10}
          maxBarHeight={20}
          borderRadius={2}
          gap={12}
          barColor="#fff"
          barShadow="0 4px 12px 0 rgba(0,0,0,0.15)"
        />
      </div>
    </div>
  )
}
