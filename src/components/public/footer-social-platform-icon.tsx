import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaTelegram, FaTiktok, FaXTwitter } from "react-icons/fa6";

type FooterSocialPlatformIconProps = {
  href: string;
  label?: string | null;
  className?: string;
};

export function FooterSocialPlatformIcon({
  href,
  label,
  className = "size-4 shrink-0",
}: FooterSocialPlatformIconProps) {
  const platformValue = `${label ?? ""} ${href}`.toLowerCase();

  if (
    platformValue.includes("whatsapp") ||
    platformValue.includes("wa.me") ||
    platformValue.includes("api.whatsapp") ||
    platformValue.includes("web.whatsapp")
  ) {
    return <FaWhatsapp aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("facebook") || platformValue.includes("fb.com")) {
    return <FaFacebookF aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("instagram")) {
    return <FaInstagram aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("youtube") || platformValue.includes("youtu.be")) {
    return <FaYoutube aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("tiktok")) {
    return <FaTiktok aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("twitter") || platformValue.includes("x.com")) {
    return <FaXTwitter aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("linkedin")) {
    return <FaLinkedinIn aria-hidden="true" className={className} />;
  }

  if (platformValue.includes("telegram") || platformValue.includes("t.me")) {
    return <FaTelegram aria-hidden="true" className={className} />;
  }

  return <FaGlobe aria-hidden="true" className={className} />;
}
