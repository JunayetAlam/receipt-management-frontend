import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ShopLogo({
  url,
  alt,
  className,
}: {
  url?: string | null;
  alt?: string | null;
  className?: string;
}) {
  if (!url) return null;

  return (
    <Image
      src={url}
      alt={alt || ""}
      width={200}
      height={200}
      className={cn("max-h-14 aspect-auto object-contain w-auto", className)}
    />
  );
}
