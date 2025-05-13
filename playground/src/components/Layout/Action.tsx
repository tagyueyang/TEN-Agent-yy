"use client";

import * as React from "react";

import { LoadingButton } from "@/components/Button/LoadingButton";
import { setAgentConnected, setMobileActiveTab } from "@/store/reducers/global";
import {
  useAppDispatch,
  useAppSelector,
  apiPing,
  apiStartService,
  apiStopService,
  MOBILE_ACTIVE_TAB_MAP,
  EMobileActiveTab,
  isEditModeOn,
} from "@/common";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RemotePropertyCfgSheet } from "@/components/Chat/ChatCfgPropertySelect";
import { RemoteGraphSelect } from "@/components/Chat/ChatCfgGraphSelect";
import { RemoteModuleCfgSheet } from "@/components/Chat/ChatCfgModuleSelect";
import { TrulienceCfgSheet } from "../Chat/ChatCfgTrulienceSetting";
import { Power } from "lucide-react";
import { AccessLogoPngIcon } from "../icons/access";

let intervalId: NodeJS.Timeout | null = null;

export default function Action(props: { className?: string }) {
  const { className } = props;
  const dispatch = useAppDispatch();
  const agentConnected = useAppSelector((state) => state.global.agentConnected);
  const channel = useAppSelector((state) => state.global.options.channel);
  const userId = useAppSelector((state) => state.global.options.userId);
  const language = useAppSelector((state) => state.global.language);
  const voiceType = useAppSelector((state) => state.global.voiceType);
  const graphName = useAppSelector((state) => state.global.selectedGraphId);
  const mobileActiveTab = useAppSelector(
    (state) => state.global.mobileActiveTab
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (channel) {
      checkAgentConnected();
    }
  }, [channel]);

  const checkAgentConnected = async () => {
    const res: any = await apiPing(channel);
    if (res?.code == 0) {
      dispatch(setAgentConnected(true));
    }
  };

  const onClickConnect = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    if (agentConnected) {
      await apiStopService(channel);
      dispatch(setAgentConnected(false));
      toast.success("Agent disconnected");
      stopPing();
    } else {
      const res = await apiStartService({
        channel,
        userId,
        graphName,
        language,
        voiceType,
      });
      const { code, msg } = res || {};
      if (code != 0) {
        if (code == "10001") {
          toast.error(
            "The number of users experiencing the program simultaneously has exceeded the limit. Please try again later."
          );
        } else {
          toast.error(`code:${code},msg:${msg}`);
        }
        setLoading(false);
        throw new Error(msg);
      }
      dispatch(setAgentConnected(true));
      toast.success("Agent connected");
      startPing();
    }
    setLoading(false);
  };

  const startPing = () => {
    if (intervalId) {
      stopPing();
    }
    intervalId = setInterval(() => {
      apiPing(channel);
    }, 3000);
  };

  const stopPing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const onChangeMobileActiveTab = (tab: string) => {
    dispatch(setMobileActiveTab(tab as EMobileActiveTab));
  };

  return (
    <>
      {/* Action Bar */}
      <div
        className={cn(
          "mx-2 mt-2 flex items-center justify-between rounded-t-lg bg-card p-2 md:m-2 md:rounded-lg",
          className
        )}
      >
        {/* -- Description Part */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <AccessLogoPngIcon className="block h-8 w-auto align-middle mr-2" />
            <div className="relative group">
              <span className="text-black text-[15px] font-medium tracking-wide relative z-10 group-hover:text-red-50 transition-colors duration-300">
                Meet <span className="text-[#E5173F] font-semibold">Tyla</span> – Your AI Partner for Smarter, Faster Customer Support. 
                <span className="block mt-0.5 text-[13px] text-gray-300 font-light"></span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#E5173F] opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col md:flex-row md:items-center justify-between md:justify-end">
          {/* -- Tabs Section */}
          <Tabs
            defaultValue={mobileActiveTab}
            className="md:hidden w-full md:flex-row"
            onValueChange={onChangeMobileActiveTab}
          >
            <TabsList className="flex justify-center md:justify-start">
              {Object.values(EMobileActiveTab).map((tab) => (
                <TabsTrigger key={tab} value={tab} className="w-24 text-sm">
                  {MOBILE_ACTIVE_TAB_MAP[tab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* -- Graph Select Part */}
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 ml-auto mr-4">
            <div style={{ display: "none" }}>
              <RemoteGraphSelect />
            </div>
            {/* {isEditModeOn && (
              <>
                <TrulienceCfgSheet />
                <RemoteModuleCfgSheet />
                <RemotePropertyCfgSheet />
              </>
            )} */}

            {/* -- Action Button */}
            <div className="flex items-center gap-2">
              <LoadingButton
                onClick={onClickConnect}
                variant={!agentConnected ? "destructive" : "default"}
                size="sm"
                disabled={graphName === "" && !agentConnected}
                className={cn(
                  "w-12 h-12 rounded-full p-0 transition-colors duration-200",
                  {
                    "bg-red-500 hover:bg-red-600": !agentConnected,
                    "bg-green-500 hover:bg-green-600": agentConnected
                  }
                )}
                loading={loading}
                svgProps={{ className: "h-4 w-4 text-white" }}
              >
                <Power className="h-6 w-6 text-white" />
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
