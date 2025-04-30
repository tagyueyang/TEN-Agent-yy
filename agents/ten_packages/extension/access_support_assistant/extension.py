#
# This file is part of TEN Framework, an open source project.
# Licensed under the Apache License, Version 2.0.
# See the LICENSE file for more information.
#
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
GET_DOCS_TOOL_NAME = "get_volcanic_docs"
GET_DOCS_DESCRIPTION = "Retrieves all available document names. This tool provides a list of all available documents."

LIST_SECTIONS_TOOL_NAME = "list_volcanic_doc_sections"
LIST_SECTIONS_DESCRIPTION = "Retrieves all available sections in the document by document name. This tool provides a list of all available sections in the document."

SEARCH_DOCS_TOOL_NAME = "search_volcanic_docs"
SEARCH_DOCS_DESCRIPTION = "Retrieves document content by document name,section name and query. This tool provides the search result and content based on the parameters. If no result is found try tweaking the parameters to and call this tool again.Use the get_volcanic_docs tool to get the relevant document names. Use the list_volcanic_doc_sections tool to get the relevant section names."


@dataclass
class DocsConfig(BaseConfig):
    # Default URL to the FastAPI service
    api_url: str = "http://host.docker.internal:8000"


class SupportExtension(AsyncLLMToolBaseExtension):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        self.session = None
        self.ten_env = None
        self.config: DocsConfig = None

    async def on_init(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_init")
        self.session = aiohttp.ClientSession()

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("on_start")
        self.config = await DocsConfig.create_async(ten_env=ten_env)
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
                name=GET_DOCS_TOOL_NAME,
                description=GET_DOCS_DESCRIPTION,
                parameters=[],
            ),
            LLMToolMetadata(
                name=SEARCH_DOCS_TOOL_NAME,
                description=SEARCH_DOCS_DESCRIPTION,
                parameters=[
                    LLMToolMetadataParameter(
                        name="query",
                        type="string",
                        description="The search term or question to find relevant documentation based on section name in the document",
                    ),
                    LLMToolMetadataParameter(
                        name="doc_name",
                        type="string",
                        description="The name of the document to search in. The available doc name can be obtain by using the get_volcanic_docs tool",
                        required=True,
                    ),
                    LLMToolMetadataParameter(
                        name="section_name",
                        type="string",
                        description="The section name to search in the document",
                        required=True,
                    ),
                ],
            ),
            LLMToolMetadata(
                name=LIST_SECTIONS_TOOL_NAME,
                description=LIST_SECTIONS_DESCRIPTION,
                parameters=[
                    LLMToolMetadataParameter(
                        name="doc_name",
                        type="string",
                        description="The name of the document to list sections for. The available doc name can be obtain by using the get_volcanic_docs tool",
                        required=True,
                    )
                ],
            ),
        ]

    async def run_tool(
        self, ten_env: AsyncTenEnv, name: str, args: dict
    ) -> LLMToolResult | None:
        ten_env.log_info(f"run_tool name: {name}, args: {args}")

        if name == SEARCH_DOCS_TOOL_NAME:
            result = await self._search_docs(args)
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )
        elif name == LIST_SECTIONS_TOOL_NAME:
            result = await self._list_sections(args)
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )
        elif name == GET_DOCS_TOOL_NAME:
            result = await self._get_docs()
            return LLMToolResultLLMResult(
                type="llmresult",
                content=json.dumps(result),
            )

    async def _search_docs(self, args: dict) -> Any:
        if "doc_name" not in args:
            raise ValueError("doc_name parameter is required")
        if "section_name" not in args:
            raise ValueError("section_name parameter is required")

        try:
            query = ""
            doc_name = args.get("doc_name")
            section_name = args.get("section_name")
            url = f"{self.config.api_url}/section-search"
            self.ten_env.log_info(
                f"section-search {query} {doc_name} {section_name} {url}")

            async with self.session.post(url, json={"query": query, "doc_name": doc_name, "section_name": section_name}) as response:
                result = await response.json()
                if len(result) > 0:
                    self.ten_env.log_debug(f"Search result: {result}")
                    return {"doc_name": result.get("results")[0].get("doc_name", ""),
                            "title": result.get("results")[0].get("title", ""),
                            "match_type": result.get("results")[0].get("match_type", ""),
                            "relevance": result.get("results")[0].get("score", ""),
                            "content": result.get("results")[0].get("content", ""), }
                return None
        except Exception as e:
            self.ten_env.log_error(f"Failed to search docs: {e}")
            return None

    async def _list_sections(self, args) -> Any:
        try:
            url = f"{self.config.api_url}/sections?" + \
                f"doc_name={args.get('doc_name')}"
            self.ten_env.log_info(
                f"sections {args.get('doc_name')} {url}")

            async with self.session.get(url) as response:
                result = await response.json()
                self.ten_env.log_debug(f"List sections result: {result}")
                return {"doc_name": result.get("doc_name"),
                        "sections": result.get("sections", ["title", "level"])}
        except Exception as e:
            self.ten_env.log_error(f"Failed to list sections: {e}")
            return None

    async def _get_docs(self) -> Any:
        try:
            url = f"{self.config.api_url}/documents"
            self.ten_env.log_info(f"documents {url}")

            async with self.session.get(url) as response:
                result = await response.json()
                self.ten_env.log_debug(f"Get docs result: {result}")
                return {"documents": result.get("documents", [])}
        except Exception as e:
            self.ten_env.log_error(f"Failed to list documents: {e}")
            return None
