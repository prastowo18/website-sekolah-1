import { MessageCircle } from "lucide-react";

import { toWhatsAppHref } from "@/lib/public-links";

type FloatingWhatsAppButtonProps = {
  phone: string;
  schoolName: string;
};

export function FloatingWhatsAppButton({
  phone,
  schoolName,
}: FloatingWhatsAppButtonProps) {
  return (
    <a
      href={toWhatsAppHref(
        phone,
        `Halo ${schoolName}, saya ingin bertanya mengenai informasi sekolah.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Hubungi ${schoolName} melalui WhatsApp`}
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
