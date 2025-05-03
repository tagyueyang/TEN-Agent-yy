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
          "mx-2 mt-2 flex items-center justify-between rounded-t-lg bg-[#181a1d] p-2 md:m-2 md:rounded-lg",
          className
        )}
      >
        {/* -- Description Part */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="font-semibold text-xl mr-4">Access Agent</span>
            <span className="text-gray-500 text-xl">A Realtime Conversational AI Agent</span>
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
                className="w-fit min-w-32 text-xl h-10"
                loading={loading}
                svgProps={{ className: "h-4 w-4 text-muted-foreground" }}
              >
                {loading
                  ? "Connecting"
                  : !agentConnected
                    ? "Connect"
                    : "Disconnect"}
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
