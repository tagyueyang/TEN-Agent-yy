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

  const subscribedVolumes = useMultibandTrackVolume(audioTrack, 20)

  return (
    <div
      className={cn(
        "flex h-[300px] w-full flex-col items-center justify-center px-4"
      )}
      style={{
        background: "linear-gradient(135deg, #E5173F 0%, #8E0E0E 100%)"
      }}
    >
      <div className="flex flex-col items-center">
        <div className="mb-1 text-2xl font-bold text-white text-center">Agent</div>
        <div style={{ height: 40, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <AudioVisualizer
            type="agent"
            frequencies={subscribedVolumes}
            barWidth={2}
            minBarHeight={8}
            maxBarHeight={30}
            borderRadius={1}
            gap={7}
            barColor="#fff"
            barShadow="0 4px 12px 0 rgba(0,0,0,0.15)"
          />
        </div>
      </div>
    </div>
  )
}
