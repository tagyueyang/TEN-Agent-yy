import json
from typing import Any
from dataclasses import dataclass
import aiohttp
import os

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

# TODO YY: change to the actual tool name
TOOL_NAME = "access_kb"
TOOL_DESCRIPTION = "Answer questions about APM Rental Property, eg Client Name, Location, Rental amount etc."
TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "question": {
            "type": "string",
            "description": "The question to ask about APM Rental Property, eg which client located at Sydney",
        }
    },
    "required": ["question"],
}

PROPERTY_API_KEY = "api_key"

# TODO YY: change to the actual url. Configure the value in the .env file
BEARER_TOKEN = os.getenv("EVO_COPILOT_BEARER_TOKEN")
BASE_URL = os.getenv("EVO_COPILOT_BASE_URL")

@dataclass
class AccessKBToolConfig(BaseConfig):
    api_key: str = ""

class AccessKBExtension(AsyncLLMToolBaseExtension):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        self.session = None
        self.ten_env = None
        self.config: AccessKBToolConfig = None

    async def on_init(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_init")
        self.session = aiohttp.ClientSession()

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_start")
        self.config = await AccessKBToolConfig.create_async(ten_env=ten_env)
        ten_env.log_info(f"config: {self.config}")
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

    # TODO YY: change to the actual tool name
    def get_tool_metadata(self, ten_env: AsyncTenEnv) -> list[LLMToolMetadata]:
        return [
            LLMToolMetadata(
                name=TOOL_NAME,
                description=TOOL_DESCRIPTION,
                parameters=[
                    LLMToolMetadataParameter(
                        name="question",
                        type="string",
                        description="The question to ask about APM Rental Property, eg which client located at Sydney",
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
            result = await self._process_question(args)
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )
        else:
            return None

    async def _process_question(self, args: dict) -> Any:
        if "question" not in args:
            raise ValueError("Failed to get property")
        question = args["question"]
        self.ten_env.log_debug(f"access_kb_question: {question}"  )
        
        answer = await self._call_copilot_skill(question)

        return answer

    async def _call_copilot_skill(self, question: str) -> Any:
        if not self.session:
            raise ValueError("Session not initialized")

        headers = {
            "Authorization": f"Bearer {BEARER_TOKEN}",
            "Content-Type": "application/json"
        }

        try:
            # Prepare the message payload
            payload = {
                "message": question,
                "agentsToBeUsed": ["AccessAnalytics"]  # TODO YY: change to the actual agent
            }
            
            url = f"{BASE_URL}/messages"
            async with self.session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract messages from the response
                    messages = data.get("messages", [])
                    
                    # Get all assistant messages instead of just the first one
                    assistant_messages = [
                        msg.get("content") 
                        for msg in messages 
                        if msg.get("author") == "assistant"
                    ]
                    
                    # Combine all assistant messages if there are multiple
                    combined_content = "\n".join(assistant_messages) if assistant_messages else "No response from assistant"
                    
                    return {
                        "question": question,
                        "answer": combined_content
                    }
                else:
                    self.ten_env.log_error(f"API call failed with status {response.status}")
                    error_text = await response.text()
                    return {
                        "question": question,
                        "answer": f"API call failed with status {response.status}: {error_text}"
                    }
        except Exception as e:
            self.ten_env.log_error(f"Error calling copilot skill: {str(e)}")
            return {
                "question": question,
                "answer": f"Error connecting to the copilot skill: {str(e)}"
            }