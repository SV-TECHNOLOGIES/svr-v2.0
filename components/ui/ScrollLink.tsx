"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/** In-page anchor that scrolls smoothly through Lenis (falls back to a normal Next.js Link). */
export function ScrollLink({
  href = "#",
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);

    // If it's a hash on the current page
    if (href.startsWith("#") || (pathname === "/" && href.startsWith("/#"))) {
      e.preventDefault();
      const targetHash = href.startsWith("/#") ? href.slice(1) : href;
      scrollTo(targetHash);
      history.replaceState(null, "", targetHash);
      return;
    }

    // If it starts with /# and we are on another page
    if (href.startsWith("/#")) {
      e.preventDefault();
      router.push(href);
      return;
    }
  };

  return <Link href={href} onClick={handle} {...props} />;
}
