import json
import aiohttp

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

# Tool command names
CMD_TOOL_REGISTER = "tool_register"
CMD_TOOL_CALL = "tool_call"

# Tool names and descriptions
SEARCH_DOCUMENT_TOOL_NAME = "get_search_support_docs"
SEARCH_DOCUMENT_DESCRIPTION = "Search support documents content based on the user prompt and product name."

@dataclass
class SupportConfig(BaseConfig):
    # Default URL from swagger
    api_url: str = "http://host.docker.internal:5068"

class SupportExtension(AsyncLLMToolBaseExtension):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        self.session = None
        self.ten_env = None
        self.config: SupportConfig = None

    async def on_init(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_init")
        self.session = aiohttp.ClientSession()

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_start")
        self.config = await SupportConfig.create_async(ten_env=ten_env)
        await super().on_start(ten_env)
        self.ten_env = ten_env

    async def on_stop(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_stop")
        if self.session:
            await self.session.close()
            self.session = None

    async def on_deinit(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_deinit")

    async def on_cmd(self, ten_env: AsyncTenEnv, cmd: Cmd) -> None:
        cmd_name = cmd.get_name()
        ten_env.log_debug("on_cmd name {}".format(cmd_name))
        await super().on_cmd(ten_env, cmd)

    def get_tool_metadata(self, ten_env: AsyncTenEnv) -> list[LLMToolMetadata]:
        return [
            LLMToolMetadata(
                name=SEARCH_DOCUMENT_TOOL_NAME,
                description=SEARCH_DOCUMENT_DESCRIPTION,
                parameters=[
                    LLMToolMetadataParameter(
                        name="prompt",
                        type="string",
                        description="The user prompt with necessary context in plain English",
                        required=True,
                    ),
                    LLMToolMetadataParameter(
                        name="productName",
                        type="string",
                        description="The name of the product to search documentation for",
                        required=True,
                    ),
                ],
            ),
        ]

    async def run_tool(
        self, ten_env: AsyncTenEnv, name: str, args: dict
    ) -> LLMToolResult | None:
        ten_env.log_info(f"run_tool name: {name}, args: {args}")

        if name == SEARCH_DOCUMENT_TOOL_NAME:
            result = await self._search_document(args)
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )

    async def _search_document(self, args: dict) -> Any:
        if "prompt" not in args:
            raise ValueError("prompt parameter is required")
        if "productName" not in args:
            raise ValueError("productName parameter is required")

        try:
            prompt = args.get("prompt")
            product_name = args.get("productName")
            url = f"{self.config.api_url}/api/SearchDocument"
            
            params = {
                "query": prompt,
                "productName": product_name
            }

            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    result = await response.json()
                    self.ten_env.log_debug(f"Search document result: {result}")
                    return result
                else:
                    self.ten_env.log_error(f"API request failed with status {response.status}")
                    return None
        except Exception as e:
            self.ten_env.log_error(f"Failed to search document: {e}")
            return None