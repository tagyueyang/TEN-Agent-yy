import * as React from "react"
import {
  useAppDispatch,
  useAutoScroll,
  LANGUAGE_OPTIONS,
  useAppSelector,
  GRAPH_OPTIONS,
  isRagGraph,
} from "@/common"
import { Bot, Brain, MessageCircleQuestion } from "lucide-react"
import { EMessageDataType, EMessageType, type IChatItem } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import AccessEvoLogo from "@/assets/access_evo_logo.svg"

export default function MessageList(props: { className?: string }) {
  const { className } = props

  const chatItems = useAppSelector((state) => state.global.chatItems)

  const containerRef = React.useRef<HTMLDivElement>(null)

  useAutoScroll(containerRef)

  return (
    <div
      ref={containerRef}
      className={cn("flex-grow space-y-2 overflow-y-auto p-4", className)}
    >
      {chatItems.map((item, index) => {
        return <MessageItem data={item} key={item.time} />
      })}
    </div>
  )
}

export function MessageItem(props: { data: IChatItem }) {
  const { data } = props

  if (data.type === EMessageType.AGENT) {
    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              <AccessEvoLogo className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm" style={{ color: "#973060" }}>Copilot</span>
        </div>
        <div className="max-w-[80%] rounded-lg bg-secondary p-2 text-secondary-foreground ml-10">
          {data.data_type === EMessageDataType.IMAGE ? (
            <img src={data.text} alt="chat" className="w-full" />
          ) : (
            <p className={data.data_type === EMessageDataType.REASON ? cn(
              "text-xs",
              "text-zinc-500",
            ) : ""}>{data.text}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-start gap-2", {
      "flex-row-reverse": data.type === EMessageType.USER,
    })}>
      <div className="max-w-[80%] rounded-lg bg-secondary p-2 text-secondary-foreground">
        {data.data_type === EMessageDataType.IMAGE ? (
          <img src={data.text} alt="chat" className="w-full" />
        ) : (
          <p className={data.data_type === EMessageDataType.REASON ? cn(
            "text-xs",
            "text-zinc-500",
          ) : ""}>{data.text}</p>
        )}
      </div>
    </div>
  )
}
