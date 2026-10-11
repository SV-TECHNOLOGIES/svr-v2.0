# SVR Tech Groups — Marketing Website

> AI-accelerated. Human-verified. Shipped fast.

The home page of svrtechgroups.com, built around one signature idea: **the Build Lattice**.
One 3D structure of glass nodes and glowing connections lives in a single fixed WebGL canvas
behind the whole page. As the visitor scrolls, it tells the story *from idea to shipped software*:
it starts as scattered ideas, gathers, is drawn as a blueprint, gets built, is verified, launches,
expands, splits into the four services, dims into a constellation, settles beside the contact
form, and finally dissolves into glowing points in the footer.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript 5.9 + React 19 |
| Styling | Tailwind CSS v4: design tokens in `app/globals.css` (`@theme`), exposed as both utilities and CSS variables |
| 3D | React Three Fiber 9 + drei 10 (environment lighting, performance monitor) on three.js r186, **one** shared canvas |
| Scroll / motion | Lenis smooth scroll synced to GSAP ScrollTrigger; Framer Motion for UI micro-interactions |
| Forms | React Hook Form + Zod 4 (one schema shared by the client and `/api/contact`) |
| Fonts / images | `next/font` (Sora + Inter), `next/image` |
| Quality | ESLint 9 (`eslint-config-next`) + Prettier (Tailwind plugin) |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run format       # Prettier
```

Node 20.9+ is required (Node 22 LTS recommended). Copy `.env.example` to `.env.local` for local configuration.

**QA switch.** Append `?lattice=high`, `?lattice=medium`, `?lattice=low`, or `?lattice=fallback` to the URL to force a quality tier or the no-WebGL fallback.

---

## Folder structure

```
app/
  layout.tsx            fonts, metadata (OG/Twitter), JSON-LD, motion boot script, providers
  page.tsx              home page: section order = lattice story order
  globals.css           design tokens (@theme) + depth, glass, button, field, reveal styles
  api/contact/route.ts  validation, honeypot, timing + rate-limit checks → lib/contact-delivery.ts
  sitemap.ts robots.ts  SEO
  icon.svg              favicon (placeholder mark)
  opengraph-image.tsx   generated 1200×630 social card (twitter-image.tsx is identical)
components/
  sections/             Navbar, Hero, Process, Impact, Services, Testimonials, Contact(+Form), Footer
  three/
    LatticeRoot.tsx       fixed canvas layer, WebGL/quality detection, lazy loading, fallback switch
    LatticeDirector.tsx   scroll position → lattice stage (reads data-lattice-stage on sections)
    LatticeCanvas.tsx     the single <Canvas>, lighting, adaptive DPR, frame driver
    LatticeScene.tsx      instanced nodes + lines + halos, per-frame morphing
    lattice-states.ts     the 11 lattice states (layouts, groups, edges, params)
    materials.ts          glass material, glowing-line shader, halo shader
    LatticeFallback.tsx   layered SVG lattice for no-WebGL
    LatticeLoader.tsx     minimal branded loader (logo + thin progress line, ≤1.5s)
  ui/                   Button (magnetic), TiltCard, Chip, Field inputs, Reveal, Parallax, Logo, icons…
  providers/            SmoothScroll (Lenis + ScrollTrigger), PointerDepth (mouse parallax), Providers
content/site.ts         ALL copy, stats, services, testimonials, contact details
lib/                    constants, GSAP setup, device quality, lattice store, anchors, schema, delivery
public/logo/            put the real logo here
```

## How the 3D works (for future pages)

- **One canvas.** `LatticeRoot` mounts a fixed full-screen layer at `z-index: 1`. Each section's
  far layer (glows + grid) sits at `z-0`, and its content sits at `z-2` (the `layer-near` utility).
  That gives three parallax depths everywhere: far = CSS layer (slowest), mid = lattice, near = content.
- **Stages.** A section declares its stage in HTML:
  `data-lattice-stage="7"` (the stage is reached when the section is centred) or `data-lattice-stage="1-5"`
  (a pinned section that scrubs through stages 1→5). `data-lattice-still="5"` sets the stage shown for reduced motion.
- **Anchors.** Lattice groups attach to DOM boxes with `data-lattice-anchor="id"`. The scene reads
  their screen rectangles every frame, so the 3D layout follows the responsive HTML layout. Example:
  the four service icons sit exactly in each card's window.
- **New page?** Add sections with `data-lattice-stage` and the anchors the stage needs (see the stage
  map at the top of `components/three/lattice-states.ts`), or add a new state there.

## Editing content

All text is in **`content/site.ts`**: hero copy, process steps, stats, services and tags,
testimonials, contact details, form options, and footer. Components never hard-code copy.
Placeholders are marked `todo: true` or `// TODO`. In development they show an amber **TODO** badge.

## Connecting the contact form

The form posts to `/api/contact`. The API validates with the shared Zod schema, filters bots (honeypot field,
submissions under 2.5s, and a 5-per-10-minutes per-IP limit), then calls `deliverContact()` in
**`lib/contact-delivery.ts`**. That file has a clearly marked `PLUG IN YOUR PROVIDER HERE` block.

| Provider | Setup |
| --- | --- |
| **Resend** (recommended) | Set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` (a sender on a domain verified in Resend) |
| **Formspree** | Set `FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxx` |
| **SMTP** (Gmail/Zoho…) | `npm i nodemailer @types/nodemailer`, then uncomment `deliverViaSmtp` |

`CONTACT_TO_EMAIL` sets the recipient (default `svrtechgroups@gmail.com`).
If no provider is configured, **development** logs the enquiry to the terminal and shows success.
**Production** returns an error, so the visitor is shown your email address and no lead is lost silently.
The rate limit is in-memory, per server instance. For a strict global limit, use Upstash Redis.

## Swapping the logo

1. Put the logo file in `public/logo/` (SVG preferred), e.g. `public/logo/svr-logo.svg`.
2. In `content/site.ts`, set `site.logo.src = "/logo/svr-logo.svg"` plus its `width`/`height`.
   Navbar and footer switch automatically. The footer uses the same file on navy, so supply a light variant if needed
   (and pass it in `components/ui/Logo.tsx`).
3. Replace `app/icon.svg` (favicon) with the logo mark.
4. Optionally restyle `app/opengraph-image.tsx` (social share card).

## Deploying to Vercel

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Vercel: **Add New → Project**, import the repo. The framework is detected as Next.js with no build settings to change.
3. Add environment variables (Project → Settings → Environment Variables):
   `NEXT_PUBLIC_SITE_URL`, `CONTACT_TO_EMAIL`, and either `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` or `FORMSPREE_ENDPOINT`.
4. Deploy, then add the custom domain (`svrtechgroups.com`) under **Settings → Domains**.
5. After the domain is live, submit `https://svrtechgroups.com/sitemap.xml` in Google Search Console.

---

## Performance design

- **One WebGL canvas**. Nodes, lines, and halos are each a single instanced draw call.
- **3D never blocks LCP.** The hero is server-rendered HTML with a pure-CSS reveal. three.js is loaded through a dynamic import
  only after `load` and browser idle (later on touch devices). A small loader marks the lattice area for at most 1.5s.
- **Demand rendering.** Full frame rate while scrolling, moving the pointer, or morphing; half rate while idle-drifting;
  nothing when the tab is hidden; and in reduced-motion, only when something changed.
- **Adaptive quality** (`lib/quality.ts`):

  | Tier | Who | Nodes | Glass | DPR cap |
  | --- | --- | --- | --- | --- |
  | high | desktop / capable GPU | 125 | real transmission | 2 |
  | medium | phones, tablets, ≤4 cores/≤4GB | 64 | clear-coat (no transmission) | 1.5 |
  | low | weak GPU, Save-Data, ≤2 cores | 48 | standard material | 1 |

  At runtime, drei's `PerformanceMonitor` lowers the resolution further if the frame rate drops.
  Every tier keeps the lattice, parallax, and depth.
- **Glow without post-processing.** The brief asked for bloom via `@react-three/postprocessing`.
  On a transparent canvas over a white page, additive bloom is invisible outside the lines themselves, and
  it adds full-screen passes. Instead, the line shader renders a soft glow falloff and the nodes get soft halos,
  which looks like bloom on both white and navy at almost no cost. The package is intentionally not installed.
- **No-WebGL / software rendering**: a layered SVG lattice with CSS scroll and mouse parallax.

## Accessibility

- `prefers-reduced-motion`: no Lenis, no pinning (Process lists all steps, Testimonials is a normal carousel),
  no parallax or camera motion. The lattice shows a still composition per section and cross-fades between them.
- The canvas is `aria-hidden`; all meaning is in HTML. Pinned or animated content has a screen-reader equivalent
  (for example, the full step list in Process).
- Skip link, semantic landmarks, visible focus rings, `aria-current` in the navigation, a labelled icon button,
  a carousel with keyboard arrows and a live region, form errors linked with `aria-describedby` and announced politely,
  and the mobile menu as a modal dialog with Escape to close and focus returned on close.
- Colour pairs are chosen for WCAG AA (body `#1E293B`, muted `#64748B`, and white on `#1D4ED8`/`#2563EB` buttons).

---

## ⚠️ TODO before launch

| # | Item | Where |
| --- | --- | --- |
| 1 | **Real statistics.** The four Impact numbers (40+, 45%, 30+, 60+) are placeholders | `content/site.ts` → `impact.stats` |
| 2 | **Real testimonials** (quote, name, role, company, rating), used with the client's permission. Never publish invented reviews | `content/site.ts` → `testimonials.items` |
| 3 | **Reply-time promise** "Typically replies within 24 hours" needs confirming | `content/site.ts` → `site.contact.replyTime` |
| 4 | **Logo.** Supply the SVR Tech Groups logo, set `site.logo.src`, replace `app/icon.svg` | see "Swapping the logo" |
| 5 | **Contact delivery.** Configure Resend / Formspree / SMTP | `.env` + `lib/contact-delivery.ts` |
| 6 | **Production URL.** Set `NEXT_PUBLIC_SITE_URL` if it differs from `https://svrtechgroups.com` | env |
| 7 | **Budget ranges / project types** in the form: confirm they match how you quote | `content/site.ts` → `contact` |
| 8 | **Service tags** (e.g. "Custom GPT & Claude", "React Native"): confirm they reflect your stack | `content/site.ts` → `services.items` |

## Acceptance checklist

- [x] Every section has 3D depth and 3+ parallax layers (far CSS layer · lattice · content, plus mouse parallax on desktop)
- [x] The lattice evolves continuously through all 11 stages with scroll-driven morphs
- [x] The hero states what SVR Tech Groups does in the first viewport (headline, subtext, service chips)
- [ ] Smooth 60fps on a mid-range laptop and Android phone: **verify on real devices** (adaptive tiers and demand rendering are built in)
- [x] Reduced-motion and no-WebGL versions (`?lattice=fallback`) render intentional, still compositions
- [x] The contact form validates inline, submits, and shows loading, success (lattice assembles), and error states
- [x] All TODO placeholders are listed above
- [ ] Lighthouse: run against the **deployed** production build (targets: desktop 90+, mobile 80+, LCP < 2.5s)
