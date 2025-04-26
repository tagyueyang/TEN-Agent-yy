#
#
# Agora Real Time Engagement
# Created in 2024-08.
# Copyright (c) 2024 Agora IO. All rights reserved.
#
#

import json
from typing import Any
from dataclasses import dataclass

from ten import Cmd
from ten.async_ten_env import AsyncTenEnv
from ten_ai_base.config import BaseConfig
from ten_ai_base.types import (
    LLMToolMetadata,
    LLMToolMetadataParameter,
    LLMToolResult,
    LLMToolResultLLMResult,
)
from ten_ai_base.llm_tool import AsyncLLMToolBaseExtension

CMD_TOOL_REGISTER = "tool_register"
CMD_TOOL_CALL = "tool_call"
CMD_PROPERTY_NAME = "name"
CMD_PROPERTY_ARGS = "args"

TOOL_NAME = "epe_tool"
TOOL_DESCRIPTION = "A tool for EasyPay functionality"
TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "description": "The query to process",
        }
    },
    "required": ["query"],
}

PROPERTY_API_KEY = "api_key"  # Required

@dataclass
class EPEToolConfig(BaseConfig):
    api_key: str = ""

class EPEToolExtension(AsyncLLMToolBaseExtension):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        self.ten_env = None
        self.config: EPEToolConfig = None

    async def on_init(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_init")

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_start")
        self.config = await EPEToolConfig.create_async(ten_env=ten_env)
        ten_env.log_info(f"config: {self.config}")
        await super().on_start(ten_env)
        self.ten_env = ten_env

    async def on_stop(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_stop")

    async def on_deinit(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_deinit")

    async def on_cmd(self, ten_env: AsyncTenEnv, cmd: Cmd) -> None:
        cmd_name = cmd.get_name()
        ten_env.log_debug("on_cmd name {}".format(cmd_name))
        await super().on_cmd(ten_env, cmd)

    def get_tool_metadata(self, ten_env: AsyncTenEnv) -> list[LLMToolMetadata]:
        return [
            LLMToolMetadata(
                name=TOOL_NAME,
                description=TOOL_DESCRIPTION,
                parameters=[
                    LLMToolMetadataParameter(
                        name="query",
                        type="string",
                        description="The query to process",
                        required=True,
                    ),
                ],
            ),
        ]

    async def run_tool(
        self, ten_env: AsyncTenEnv, name: str, args: dict
    ) -> LLMToolResult | None:
        ten_env.log_info(f"run_tool name: {name}, args: {args}")
        if name == TOOL_NAME:
            result = await self._process_query(args)
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )

    async def _process_query(self, args: dict) -> Any:
        if "query" not in args:
            raise ValueError("Failed to get query property")

        # Hardcoded return value for initial version
        return {
            "status": "success",
            "message": "This is a hardcoded response from the EPE tool",
            "data": {
                "query": args["query"],
                "result": "Sample result for " + args["query"]
            }
        } 