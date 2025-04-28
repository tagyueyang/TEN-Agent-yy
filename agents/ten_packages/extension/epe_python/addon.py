#
#
# Agora Real Time Engagement
# Created in 2024-08.
# Copyright (c) 2024 Agora IO. All rights reserved.
#
#
from ten import (
    Addon,
    register_addon_as_extension,
    TenEnv,
)

@register_addon_as_extension("epe_python")
class EPEToolExtensionAddon(Addon):
    def on_create_instance(self, ten_env: TenEnv, name: str, context) -> None:
        from .extension import EPEToolExtension
        ten_env.log_info("EPEToolExtensionAddon on_create_instance")
        ten_env.on_create_instance_done(EPEToolExtension(name), context) 