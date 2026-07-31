import type { ReactNode } from "react";

import { PublicMotionShell } from "@/components/motion/public-motion-shell";

type PublicTemplateProps = {
  children: ReactNode;
};

export default function PublicTemplate({ children }: PublicTemplateProps) {
  return <PublicMotionShell>{children}</PublicMotionShell>;
}
