from ten import (
    Addon,
    register_addon_as_extension,
    TenEnv,
)

@register_addon_as_extension("access_kb")
class AccessKBExtensionAddon(Addon):
    def on_create_instance(self, ten_env: TenEnv, name: str, context) -> None:
        from .extension import SupportExtension
        ten_env.log_info("AccessKBExtensionAddon on_create_instance")
        ten_env.on_create_instance_done(SupportExtension(name), context) 