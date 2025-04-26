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
        self.response_text = ten_env.get_property_string("response_text")
        
        # Set default if property is None
        if self.response_text is None:
            self.response_text = "YY's Hello World Testing"  # Default matches property.json

        ten_env.log_info(f"HelloWorld: Configured with response_text: {self.response_text}")
        ten_env.log_debug(f"HelloWorld: Configured with response_text: {self.response_text}")

    async def on_start(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_start")
        # Send initial message on start
        await self.send_hello_world(ten_env)

    async def on_stop(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_stop")

    async def on_deinit(self, ten_env: AsyncTenEnv) -> None:
        ten_env.log_debug("HelloWorld: on_deinit")

    async def on_cmd(self, ten_env: AsyncTenEnv, cmd: Cmd) -> None:
        cmd_name = cmd.get_name()
        ten_env.log_debug(f"HelloWorld: on_cmd name {cmd_name}")

        try:
            # Return configured response for any command
            cmd_result = CmdResult.create(StatusCode.OK)
            cmd_result.set_property_string("text", str(self.response_text))  # Convert to string
            await ten_env.return_result(cmd_result, cmd)
        except Exception as e:
            ten_env.log_error(f"HelloWorld: Error in on_cmd: {str(e)}")

    async def on_data(self, ten_env: AsyncTenEnv, data: Data) -> None:
        data_name = data.get_name()
        ten_env.log_info(f"HelloWorld: Received data with name {data_name}")

        try:
            if data_name == "text_data":
                # Create and send response using configured text
                response = Data.create("text_data")
                response.set_property_string("text", str(self.response_text))  # Convert to string
                response.set_property_bool("is_final", True)
                await ten_env.send_data(response)
                
                # Also send a flush command to TTS
                flush_cmd = Cmd.create("flush")
                await ten_env.send_cmd(flush_cmd)
                
                ten_env.log_info(f"HelloWorld: Sent response: {self.response_text}")
        except Exception as e:
            ten_env.log_error(f"HelloWorld: Error processing data: {str(e)}")

    async def send_hello_world(self, ten_env: AsyncTenEnv) -> None:
        try:
            # Create a response data object with configured text
            response = Data.create("text_data")
            response.set_property_string("text", str(self.response_text))  # Convert to string
            response.set_property_bool("is_final", True)
            await ten_env.send_data(response)
            
            # Send a flush command to TTS
            flush_cmd = Cmd.create("flush")
            await ten_env.send_cmd(flush_cmd)
            
            ten_env.log_info(f"HelloWorld: Sent {self.response_text} response")
        except Exception as e:
            ten_env.log_error(f"HelloWorld: Error in send_hello_world: {str(e)}")

    async def on_audio_frame(
        self, ten_env: AsyncTenEnv, audio_frame: AudioFrame
    ) -> None:
        pass

    async def on_video_frame(
        self, ten_env: AsyncTenEnv, video_frame: VideoFrame
    ) -> None:
        pass
