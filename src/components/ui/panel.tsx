import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div className={cx("panel", className)} {...props}>
      {children}
    </div>
  );
}
