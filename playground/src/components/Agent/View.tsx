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
  
  // Calculate average frequency for pulsation
  const averageFrequency = subscribedVolumes.length > 0 
    ? subscribedVolumes.reduce((sum, frequencies) => 
        sum + frequencies.reduce((a, b) => a + b, 0) / frequencies.length, 0
      ) / subscribedVolumes.length 
    : 0

  // Scale the pulsation effect based on frequency
  const scale = 1 + (averageFrequency * 0.1) // Adjust 0.1 to control pulsation intensity

  return (
    <div
      className={cn(
        "flex w-full h-full items-center justify-center bg-background",
      )}
    >
      <div className="relative">
        {/* Background circle */}
        <div 
          className="absolute aspect-square rounded-full w-[520px] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)",
            filter: "blur(20px)",
            transform: `perspective(1000px) rotateX(2deg) translate(-50%, -50%) scale(${scale})`,
            transition: "transform 0.25s ease-out"
          }}
        />
        {/* Main circle */}
        <div
          className="relative flex aspect-square rounded-full shadow-2xl w-[500px] items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #E5173F 0%, #8E0E0E 100%)",
            transform: `perspective(1000px) rotateX(2deg) scale(${scale})`,
            transition: "transform 0.25s ease-out",
            boxShadow: `0 ${20 + averageFrequency * 10}px ${40 + averageFrequency * 20}px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.1)`
          }}
        >
          <div className="flex flex-col items-center gap-8">
            <AudioVisualizer
              type="agent"
              frequencies={subscribedVolumes}
              barWidth={8}
              minBarHeight={20}
              maxBarHeight={100}
              borderRadius={12}
              gap={14}
              barColor="#fff"
              barShadow="0 4px 12px 0 rgba(0,0,0,0.15)"
            />
            {/* <div className="text-3xl font-bold text-white">Tyla</div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
