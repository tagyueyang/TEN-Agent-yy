"use client"

import * as React from "react"
import { useMultibandTrackVolume } from "@/common"
import AudioVisualizer from "@/components/Agent/AudioVisualizer"
import AgoraRTC, { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MicIconByStatus } from "@/components/Icon"
import { Volume2 } from "lucide-react"

export default function AudioSettingsMicrophone(props: {
  audioTrack?: IMicrophoneAudioTrack
}) {
  const { audioTrack } = props
  const [audioMute, setAudioMute] = React.useState(false)
  const [mediaStreamTrack, setMediaStreamTrack] =
    React.useState<MediaStreamTrack>()

  React.useEffect(() => {
    audioTrack?.on("track-updated", onAudioTrackupdated)
    if (audioTrack) {
      setMediaStreamTrack(audioTrack.getMediaStreamTrack())
    }
    return () => {
      audioTrack?.off("track-updated", onAudioTrackupdated)
    }
  }, [audioTrack])

  React.useEffect(() => {
    audioTrack?.setMuted(audioMute)
  }, [audioTrack, audioMute])

  const subscribedVolumes = useMultibandTrackVolume(mediaStreamTrack, 20)

  const onAudioTrackupdated = (track: MediaStreamTrack) => {
    setMediaStreamTrack(track)
  }

  const onClickMute = () => {
    setAudioMute(!audioMute)
  }

  return (
    <div className="bg-[#181818] rounded-lg px-4 py-8">
      <div className="flex items-center mb-4">
        <Volume2 className="text-white" size={20} />
        <span className="text-white text-xl font-bold pl-2">Audio settings</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white text-xl pl-8">Microphone</span>
        <div className="flex items-center gap-2 ml-40">
          <Button
            variant="outline"
            size="icon"
            className="border-secondary bg-transparent h-[2.5rem] w-[2.5rem] flex items-center justify-center p-0"
            onClick={onClickMute}
          >
            <MicIconByStatus className="h-12 w-12" active={!audioMute} />
          </Button>
          <div>
            <MicrophoneSelect audioTrack={props.audioTrack} />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="w-[518px]">
          <div className="mt-3 flex h-20 flex-col items-center justify-center gap-2.5 self-stretch rounded-md border border-[#272A2F] bg-[#1E2024] p-2 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]">
            <AudioVisualizer
              type="user"
              barWidth={2}
              minBarHeight={8}
              maxBarHeight={70}
              frequencies={subscribedVolumes}
              borderRadius={1}
              gap={7}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MicrophoneDropdown({
  audioTrack,
  audioMute,
  onClickMute,
}: {
  audioTrack?: IMicrophoneAudioTrack
  audioMute: boolean
  onClickMute: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="border-secondary bg-transparent"
        onClick={onClickMute}
      >
        <MicIconByStatus className="h-12 w-12" active={!audioMute} />
      </Button>
      <div>
        <MicrophoneSelect audioTrack={audioTrack} />
      </div>
    </div>
  )
}

export type TDeviceSelectItem = {
  label: string
  value: string
  deviceId: string
}

export const DEFAULT_DEVICE_ITEM: TDeviceSelectItem = {
  label: "Default",
  value: "default",
  deviceId: "",
}

export const DeviceSelect = (props: {
  items: TDeviceSelectItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) => {
  const { items, value, onChange, placeholder } = props

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[248px] h-auto min-h-[2.5rem] text-xl bg-[#232323] border border-[#444] rounded-md text-white items-start">
        <SelectValue
          placeholder={placeholder}
          className="whitespace-normal break-words h-auto min-h-[2.5rem] text-xl leading-tight py-1"
        />
      </SelectTrigger>
      <SelectContent side="bottom" className="w-[248px]">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="whitespace-normal break-words w-[248px] text-xl leading-tight min-h-[3.5rem] flex items-center"
          >
            <span className="block w-full text-left">
              {item.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const MicrophoneSelect = (props: {
  audioTrack?: IMicrophoneAudioTrack
}) => {
  const { audioTrack } = props
  const [items, setItems] = React.useState<TDeviceSelectItem[]>([
    DEFAULT_DEVICE_ITEM,
  ])
  const [value, setValue] = React.useState("default")

  React.useEffect(() => {
    if (audioTrack) {
      const label = audioTrack?.getTrackLabel()
      setValue(label)
      AgoraRTC.getMicrophones().then((arr) => {
        setItems(
          arr.map((item) => ({
            label: item.label,
            value: item.label,
            deviceId: item.deviceId,
          })),
        )
      })
    }
  }, [audioTrack])

  const onChange = async (value: string) => {
    const target = items.find((item) => item.value === value)
    if (target) {
      setValue(target.value)
      if (audioTrack) {
        await audioTrack.setDevice(target.deviceId)
      }
    }
  }

  return <DeviceSelect items={items} value={value} onChange={onChange} />
}