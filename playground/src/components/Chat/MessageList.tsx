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
import { AccessEvoIcon } from "../Icon"

// Helper: very basic markdown and line break support
function formatAgentMessage(text: string): string {
  // Escape HTML
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, "<i>$1</i>")
  // Unordered list: - item
  html = html.replace(/(^|\n)- (.*?)(?=\n|$)/g, "$1<li>$2</li>")
  if (html.includes("<li>")) {
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
  }
  // Line breaks
  html = html.replace(/\n/g, "<br />")
  return html
}

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

  // Log the agent message text to the console
  if (data.type === EMessageType.AGENT) {
    console.log("Agent message text:", data.text)

    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              <AccessEvoIcon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <span
            className="font-semibold text-[17px]"
            style={{ color: "#973060" }}
          >
            Access Agent
          </span>
        </div>
        <div className="max-w-[80%] rounded-lg bg-secondary p-2 text-secondary-foreground ml-10">
          {data.data_type === EMessageDataType.IMAGE ? (
            <img src={data.text} alt="chat" className="w-full" />
          ) : (
            <p className={data.data_type === EMessageDataType.REASON ? cn(
              "text-[16px]",
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
            "text-[16px]",
            "text-zinc-500",
          ) : ""}>{data.text}</p>
        )}
      </div>
    </div>
  )
}
