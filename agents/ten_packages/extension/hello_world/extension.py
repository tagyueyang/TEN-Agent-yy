#
# This file is part of TEN Framework, an open source project.
# Licensed under the Apache License, Version 2.0.
# See the LICENSE file for more information.
#
from ten import (
    AudioFrame,
    VideoFrame,
    AsyncExtension,
    AsyncTenEnv,
    Cmd,
    StatusCode,
    CmdResult,
    Data,
)


class HelloWorldExtension(AsyncExtension):
    async def on_init(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_init")
        # Get configuration from property.json
        self.enabled = ten_env.get_property_bool("enabled")  # Remove the default value
        self.response_text = ten_env.get_property_string("response_text")  # Remove the default value
        
        # Set defaults if properties are None
        if self.enabled is None:
            self.enabled = True
        if self.response_text is None:
            self.response_text = "Hello World"

        ten_env.log_info(f"HelloWorldyy: Configured with response_text: {self.response_text}")
        ten_env.log_debug(f"HelloWorld: Configured with response_text: {self.response_text}")

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_start")
        # if self.enabled:
            # Send initial message
            # await self.send_hello_world(ten_env)

    async def on_stop(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_stop")

    async def on_deinit(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_deinit")

    async def on_cmd(self, ten_env: AsyncTenEnv, cmd: Cmd) -> None:
        if not self.enabled:
            return
            
        cmd_name = cmd.get_name()
        ten_env.log_debug(f"HelloWorld: on_cmd name {cmd_name}")

        # Return configured response for any command
        cmd_result = CmdResult.create(StatusCode.OK)
        cmd_result.set_property_string("text", self.response_text)
        await ten_env.return_result(cmd_result, cmd)

    async def on_data(self, ten_env: AsyncTenEnv, data: Data) -> None:
        if not self.enabled:
            return
            
        data_name = data.get_name()
        ten_env.log_info(f"HelloWorld: Received data with name {data_name}")

        try:
            if data_name == "text_data":
                # Create and send response using configured text
                response = Data.create("text_data")
                response.set_property_string("text", "EasyPay is a payroll product under The Access Group")
                response.set_property_bool("is_final", True)
                await ten_env.send_data(response)
                # ten_env.log_info(f"HelloWorld: Sent Hello World - Yy Testing response")
        except Exception as e:
            ten_env.log_error(f"HelloWorld: Error processing data: {str(e)}")

    async def send_hello_world(self, ten_env: AsyncTenEnv) -> None:
        # Create a response data object with configured text
        response = Data.create("text_data")
        response.set_property_string("text", "Hello World - yy123")
        response.set_property_bool("is_final", True)
        await ten_env.send_data(response)
        ten_env.log_info(f"HelloWorld: Sent {self.response_text} response")

    async def on_audio_frame(
        self, ten_env: AsyncTenEnv, audio_frame: AudioFrame
    ) -> None:
        pass

    async def on_video_frame(
        self, ten_env: AsyncTenEnv, video_frame: VideoFrame
    ) -> None:
        pass
