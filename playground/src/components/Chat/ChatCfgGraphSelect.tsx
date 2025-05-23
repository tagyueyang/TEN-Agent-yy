import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/common/hooks"
import {
  setSelectedGraphId,
} from "@/store/reducers/global"
import { useIsCompactLayout } from "@/common"
import { cn } from "@/lib/utils"


export function RemoteGraphSelect() {
    const dispatch = useAppDispatch()
    const graphName = useAppSelector((state) => state.global.selectedGraphId)
    const graphs = useAppSelector((state) => state.global.graphList)
    const agentConnected = useAppSelector((state) => state.global.agentConnected)
    
    // Set default if not set or not in list, and available in list
    React.useEffect(() => {
      if (
        graphs.length > 0 &&
        (!graphName || !graphs.includes(graphName)) &&
        graphs.includes("voice_assistant_realtime")
      ) {
        dispatch(setSelectedGraphId("voice_assistant_realtime"))
      }
    }, [graphs, graphName, dispatch])

    const onGraphNameChange = (val: string) => {
      dispatch(setSelectedGraphId(val))
    }
  
    const graphOptions = graphs.map((item) => ({
      label: item,
      value: item,
    }))
  
    return (
      <>
        <Select
          value={graphName}
          onValueChange={onGraphNameChange}
          disabled={agentConnected}
        >
          <SelectTrigger
            className={cn(
              "w-auto text-xl",
            )}
          >
            <SelectValue placeholder={"Select Graph"} className="text-xl" />
          </SelectTrigger>
          <SelectContent>
            {graphOptions.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-xl">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )
  }
  