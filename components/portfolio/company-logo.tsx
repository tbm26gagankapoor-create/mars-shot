"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SECTOR_AVATAR_COLORS } from "@/lib/constants";

interface CompanyLogoProps {
  companyName: string;
  website?: string | null;
  sector?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const imgSizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
};

function getFaviconUrl(website: string): string {
  try {
    const domain = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return "";
  }
}

export function CompanyLogo({
  companyName,
  website,
  sector,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = website ? getFaviconUrl(website) : "";
  const initial = companyName.charAt(0).toUpperCase();
  const avatarColor =
    SECTOR_AVATAR_COLORS[sector ?? ""] ?? SECTOR_AVATAR_COLORS.OTHER;

  if (faviconUrl && !imgError) {
    return (
      <div
        className={cn(
          "relative shrink-0 rounded-lg overflow-hidden border bg-white",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={faviconUrl}
          alt={`${companyName} logo`}
          width={imgSizeMap[size]}
          height={imgSizeMap[size]}
          className="object-contain p-1"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-lg flex items-center justify-center font-semibold",
        sizeMap[size],
        avatarColor,
        className
      )}
    >
      {initial}
    </div>
  );
}
