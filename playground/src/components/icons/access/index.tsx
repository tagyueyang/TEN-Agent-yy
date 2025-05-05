import { IconProps } from "../types"
import AccessLogoSvg from "@/assets/access_logo.svg"
import AccessLogoPng from "@/assets/access_logo.png"
import Image, { ImageProps } from "next/image"

export const AccessLogoIcon = (props: IconProps) => {
  return <AccessLogoSvg {...props}></AccessLogoSvg>
}
export const AccessLogoPngIcon = ({
  className = "",
  ...props
}: Omit<ImageProps, "src" | "alt"> & { className?: string }) => (
  <Image src={AccessLogoPng} alt="Access Logo" className={className} {...props} />
);