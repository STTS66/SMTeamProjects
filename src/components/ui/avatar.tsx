"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

const sizeClasses = {
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg"
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const hasImage = Boolean(src) && !failed;

  return (
    <div className={cx("avatar", sizeClasses[size], className)}>
      {hasImage ? (
        <img
          src={src ?? ""}
          alt={name ? `Avatar ${name}` : "User avatar"}
          className="avatar-image"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="avatar-placeholder" aria-hidden="true">
          <span className="avatar-placeholder-head" />
          <span className="avatar-placeholder-body" />
        </span>
      )}
    </div>
  );
}
