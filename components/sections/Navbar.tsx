"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/content/site";
import strings from "@/strings.json";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Close, Menu } from "@/components/ui/icons";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { EASE } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { scrollTo, stop, start } = useSmoothScroll();

  // Transparent at the top → frosted glass + shrink once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view when on the home page.
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = nav.links
      .map((l) => (l.href.startsWith("/#") ? l.href.slice(2) : l.href.startsWith("#") ? l.href.slice(1) : ""))
      .filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Mobile menu: lock scroll, close on Escape, restore focus.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open, stop, start]);

  const go = (e: MouseEvent, href: string) => {
    setOpen(false);

    // If it's an anchor on the same page
    if (href.startsWith("#") || (pathname === "/" && href.startsWith("/#"))) {
      e.preventDefault();
      const targetHash = href.startsWith("/#") ? href.slice(1) : href;
      window.setTimeout(() => scrollTo(targetHash), open ? 260 : 0);
      history.replaceState(null, "", targetHash);
      return;
    }

    // Normal multi-page route
    if (!href.startsWith("#") && !href.startsWith("/#")) {
      return;
    }

    // Navigating from another page to home anchor (e.g. from /portfolio to /#services)
    e.preventDefault();
    router.push(href);
  };

  return (
    <>
      <a
        href="#main"
        className="bg-navy fixed top-3 left-3 z-[100] -translate-y-20 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
      >
        {strings.nav.skipToContent}
      </a>
      <header
        className={`ease-svr fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "border-b border-white/60 bg-white/70 shadow-[0_8px_30px_-18px_rgb(29_78_216/0.35)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className={`container-site ease-svr flex items-center justify-between transition-[height] duration-700 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                scrollTo("#top");
              }
            }}
            aria-label={`${site.name} — home`}
            className="rounded-lg"
          >
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.links.map((l) => {
              const isPageActive = pathname === l.href;
              const isAnchorActive = pathname === "/" && (active === l.href.slice(1) || active === l.href.slice(2));
              const isActive = isPageActive || isAnchorActive;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`ease-svr relative rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-500 ${
                      isActive ? "text-primary font-semibold" : "text-ink/80 hover:text-navy"
                    }`}
                  >
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="from-primary to-glow absolute inset-x-3.5 -bottom-0.5 h-px bg-gradient-to-r"
                        transition={{ duration: 0.6, ease: EASE }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              href={nav.cta.href}
              size="md"
              className="hidden sm:inline-flex"
              iconAfter={<ArrowRight className="h-4 w-4" />}
            >
              {nav.cta.label}
            </Button>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="border-line text-navy shadow-chip inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/80 backdrop-blur md:hidden"
            >
              <Menu />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col bg-white/95 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: EASE, delay: 0.1 } }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="far-grid absolute inset-0" />
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.22),transparent)]" />
              <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(147_197_253/0.3),transparent)]" />
            </div>
            <div className="container-site relative flex h-20 items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                autoFocus
                className="border-line text-navy shadow-chip inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white"
              >
                <Close />
              </button>
            </div>
            <ul
              className="container-site relative mt-6 flex flex-col gap-1"
              style={{ perspective: 800 }}
            >
              {nav.links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 28, z: -80 }}
                  animate={{ opacity: 1, y: 0, z: 0 }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    transition: { duration: 0.25, delay: (nav.links.length - i) * 0.03 },
                  }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.08 + i * 0.06 }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="border-line font-display text-navy flex items-baseline gap-4 border-b py-4 text-[2rem] font-semibold tracking-[-0.03em]"
                  >
                    <span className="text-primary font-sans text-sm font-medium tabular-nums">
                      0{i + 1}
                    </span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="container-site relative mt-auto pb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            >
              <a
                href={nav.cta.href}
                onClick={(e) => go(e, nav.cta.href)}
                className="btn btn-lg btn-primary w-full text-white"
              >
                <span className="btn-face">
                  {nav.cta.label} <ArrowRight className="h-4 w-4" />
                </span>
              </a>
              <p className="text-muted mt-5 text-center text-sm">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {site.contact.email}
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
