import Image from "next/image";
import { cx } from "@/lib/utils";

const sizeClasses = {
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg"
} as const;

function getInitials(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return "SM";
  }

  const parts = normalized.split(/\s+/).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");

  return initials || "SM";
}

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
  return (
    <div className={cx("avatar", sizeClasses[size], className)}>
      {src ? (
        <Image
          src={src}
          alt={name ? `Аватар ${name}` : "Аватар пользователя"}
          fill
          sizes={size === "lg" ? "96px" : size === "md" ? "56px" : "40px"}
          className="avatar-image"
        />
      ) : (
        <span className="avatar-fallback">{getInitials(name)}</span>
      )}
    </div>
  );
}
