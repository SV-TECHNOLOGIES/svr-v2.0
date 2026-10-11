/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT — integrates strings.json (copy) and app-config.json (dynamic config).
 *
 *  Anything marked `todo: true` or `// TODO` is a placeholder that must be
 *  replaced before launch. In development these render with a small amber
 *  "TODO" badge so they are easy to spot. The full list lives in README.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import strings from "@/strings.json";
import appConfig from "@/app-config.json";

export const site = {
  name: appConfig.site?.name ?? "SVR Tech Groups",
  shortName: appConfig.site?.shortName ?? "SVR Tech",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? appConfig.site?.defaultUrl ?? "https://svrtechgroups.com",
  positioning: strings.site?.positioning ?? "",
  seo: {
    title: strings.site?.seo?.title ?? "",
    description: strings.site?.seo?.description ?? "",
    keywords: appConfig.site?.keywords ?? [],
  },
  /**
   * Logo. Leave `src` as null to use the built-in placeholder mark.
   * When the real logo arrives: drop it in /public/logo/ and set `src`,
   * e.g. "/logo/svr-logo.svg", plus its intrinsic width/height.
   */
  logo: {
    src: (appConfig.site?.logo?.src as string | null) ?? null,
    width: appConfig.site?.logo?.width ?? 160,
    height: appConfig.site?.logo?.height ?? 40,
    alt: appConfig.site?.logo?.alt ?? appConfig.site?.name ?? "SVR Tech Groups",
  },
  contact: {
    email: appConfig.site?.contact?.email ?? "",
    phone: appConfig.site?.contact?.phone ?? "",
    phoneHref: appConfig.site?.contact?.phoneHref ?? "",
    whatsapp: appConfig.site?.contact?.whatsapp ?? "",
    whatsappHref: appConfig.site?.contact?.whatsappHref ?? "",
    location: strings.site?.contact?.location ?? "",
    city: appConfig.site?.contact?.city ?? "",
    region: appConfig.site?.contact?.region ?? "",
    country: appConfig.site?.contact?.country ?? "",
    replyTime: strings.site?.contact?.replyTime ?? "",
    replyTimeTodo: appConfig.site?.contact?.replyTimeTodo ?? false,
  },
  social: (appConfig.site?.social ?? []) as readonly {
    label: string;
    href: string;
    icon: "linkedin" | "instagram";
  }[],
} as const;

export const nav = {
  links: (appConfig.nav?.links ?? []) as readonly {
    label: string;
    href: string;
  }[],
  cta: appConfig.nav?.cta ?? {
    label: "Start a Project",
    href: "/#contact",
  },
} as const;

export const hero = {
  eyebrow: strings.hero?.eyebrow ?? "",
  /** Each entry is one headline line; `highlight` parts get the blue gradient. */
  headline: [
    [
      { text: strings.hero?.headline?.part1 ?? "" },
      { text: strings.hero?.headline?.part2 ?? "", highlight: true },
    ],
    [{ text: strings.hero?.headline?.part3 ?? "" }],
  ],
  subtext: strings.hero?.subtext ?? "",
  primaryCta: appConfig.hero?.primaryCta ?? {
    label: "Start a Project",
    href: "/#contact",
  },
  secondaryCta: {
    label: strings.hero?.secondaryCta ?? "See How We Build",
    href: appConfig.hero?.secondaryCta?.href ?? "/#process",
  },
  chips: (appConfig.hero?.chips ?? []) as readonly string[],
  scrollHint: appConfig.hero?.scrollHint ?? "Scroll",
} as const;

// ─── HOW WE BUILD (DYNAMIC MAPPING) ──────────────────────────────────────────
export interface HowWeBuildStep {
  number: string;
  title: string;
  body: string;
  points: readonly string[];
}

const rawAppSteps = Array.isArray(appConfig.howWeBuild?.steps) ? appConfig.howWeBuild.steps : [];
const rawStrSteps = Array.isArray(strings.howWeBuild?.steps) ? strings.howWeBuild.steps : [];
const totalStepCount = Math.max(rawAppSteps.length, rawStrSteps.length);

const dynamicSteps: HowWeBuildStep[] = Array.from({ length: totalStepCount }, (_, index) => {
  const appStep = rawAppSteps[index] as { number?: string; title?: string; points?: string[] } | undefined;
  const strStep = rawStrSteps[index] as { title?: string; body?: string; points?: string[] } | undefined;

  const combinedPoints: string[] = [
    ...(Array.isArray(appStep?.points) ? appStep.points : []),
    ...(Array.isArray(strStep?.points) ? strStep.points : []),
  ];

  const uniquePoints = Array.from(
    new Set(
      combinedPoints
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map((p) => p.trim()),
    ),
  );

  return {
    number: appStep?.number ?? String(index + 1).padStart(2, "0"),
    title: appStep?.title || strStep?.title || `Step ${index + 1}`,
    body: strStep?.body || "",
    points: uniquePoints,
  };
});

export const howWeBuild = {
  eyebrow: strings.howWeBuild?.eyebrow ?? "How we build",
  title: strings.howWeBuild?.title ?? "",
  intro: strings.howWeBuild?.intro ?? "",
  steps: dynamicSteps,
  /** Small live labels shown beside the lattice during steps 03–05. */
  indicators: {
    build: strings.howWeBuild?.indicators?.build ?? "AI-assisted build velocity",
    qa: (Array.isArray(appConfig.howWeBuild?.indicators?.qa)
      ? appConfig.howWeBuild.indicators.qa
      : ["Code review", "Automated tests", "Security", "Performance"]) as readonly string[],
    launch: appConfig.howWeBuild?.indicators?.launch ?? "Live · monitored",
  },
} as const;

export const impact = {
  eyebrow: "Impact",
  title: strings.impact?.title ?? "",
  stats: (Array.isArray(appConfig.impact?.stats) ? appConfig.impact.stats : []) as readonly {
    value: number;
    suffix?: string;
    label: string;
    todo?: boolean;
  }[],
  outcome: strings.impact?.outcome ?? "",
} as const;

// ─── SERVICES (DYNAMIC MAPPING) ──────────────────────────────────────────────
export type ServiceIcon = "browser" | "phone" | "agent" | "workflow" | string;

export interface ServiceItem {
  icon: ServiceIcon;
  title: string;
  body: string;
  tags: readonly string[];
}

const serviceKeyByIcon: Record<string, string> = {
  browser: "websites",
  phone: "mobileApps",
  agent: "aiAgents",
  workflow: "aiWorkflowAutomation",
};
const defaultServiceKeys = ["websites", "mobileApps", "aiAgents", "aiWorkflowAutomation"];

const rawConfigServices = Array.isArray(appConfig.services?.items) ? appConfig.services.items : [];
const strServiceItems = (strings.services?.items ?? {}) as Record<
  string,
  { title?: string; body?: string; tags?: string[] } | undefined
>;

const mappedServices: ServiceItem[] = rawConfigServices.map((cfgItem, index) => {
  const iconStr = cfgItem?.icon ?? "browser";
  const mappedKey = serviceKeyByIcon[iconStr] ?? defaultServiceKeys[index] ?? "";
  const strItem = mappedKey ? strServiceItems[mappedKey] : undefined;

  const rawTags = [
    ...(Array.isArray(strItem?.tags) ? strItem.tags : []),
    ...(Array.isArray(cfgItem?.tags) ? cfgItem.tags : []),
  ];

  const uniqueTags = Array.from(
    new Set(
      rawTags
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim()),
    ),
  );

  return {
    icon: iconStr as ServiceIcon,
    title: (cfgItem as { title?: string })?.title || strItem?.title || "Service",
    body: strItem?.body || "",
    tags: uniqueTags,
  };
});

const fallbackServices: ServiceItem[] = defaultServiceKeys.map((key) => {
  const item = strServiceItems[key];
  const icon = Object.keys(serviceKeyByIcon).find((k) => serviceKeyByIcon[k] === key) ?? "browser";
  return {
    icon: icon as ServiceIcon,
    title: item?.title || key,
    body: item?.body || "",
    tags: (Array.isArray(item?.tags) ? item.tags : []) as readonly string[],
  };
});

export const services = {
  eyebrow: "Services",
  title: strings.services?.title ?? "Services",
  intro: strings.services?.intro ?? "",
  items: mappedServices.length > 0 ? mappedServices : fallbackServices,
} as const;

// ─── TESTIMONIALS (DYNAMIC MAPPING) ──────────────────────────────────────────
export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  todo?: boolean;
}

const rawStrTestimonials = Array.isArray(strings.testimonials?.items) ? strings.testimonials.items : [];
const rawAppTestimonials = Array.isArray(appConfig.testimonials?.items) ? appConfig.testimonials.items : [];
const testimonialTotal = Math.max(rawStrTestimonials.length, rawAppTestimonials.length);

const dynamicTestimonials: TestimonialItem[] = Array.from({ length: testimonialTotal }, (_, i) => {
  const str = (rawStrTestimonials[i] ?? {}) as { quote?: string; role?: string; name?: string };
  const app = (rawAppTestimonials[i] ?? {}) as {
    name?: string;
    role?: string;
    company?: string;
    rating?: number;
    todo?: boolean;
    quote?: string;
  };

  return {
    quote: str.quote || app.quote || "",
    name: app.name || str.name || "Client",
    role: str.role || app.role || "Verified Client",
    company: app.company || "",
    rating: typeof app.rating === "number" ? app.rating : 5,
    todo: app.todo ?? false,
  };
}).filter((t) => Boolean(t.quote || t.name));

export const testimonials = {
  eyebrow: "Testimonials",
  title: strings.testimonials?.title ?? "Testimonials",
  viewMore: appConfig.testimonials?.viewMore,
  items: dynamicTestimonials,
} as const;

// ─── CONTACT (DYNAMIC BUDGETS & PROJECT TYPES) ───────────────────────────────
const rawConfigBudgets = Array.isArray(appConfig.contact?.budgets) ? appConfig.contact.budgets : [];
const under1Lakh = strings.contact?.budgets?.under1Lakh;
const notSureYet = strings.contact?.budgets?.notSureYet;

const dynamicBudgets = [
  ...(under1Lakh ? [under1Lakh] : []),
  ...rawConfigBudgets,
  ...(notSureYet ? [notSureYet] : []),
].filter((b): b is string => typeof b === "string" && b.trim().length > 0);

const safeBudgets = (
  dynamicBudgets.length > 0
    ? dynamicBudgets
    : ["Under ₹1 lakh", "₹1–3 lakh", "₹3–10 lakh", "₹10 lakh+", "Not sure yet"]
) as unknown as readonly [string, ...string[]];

const rawProjectTypes = Array.isArray(appConfig.contact?.projectTypes) ? appConfig.contact.projectTypes : [];
const safeProjectTypes = (
  rawProjectTypes.length > 0
    ? rawProjectTypes.filter((pt): pt is string => typeof pt === "string" && pt.trim().length > 0)
    : ["Website", "Mobile App", "AI Agent", "AI Automation", "Other"]
) as unknown as readonly [string, ...string[]];

export const contact = {
  eyebrow: "Contact",
  title: strings.contact?.title ?? "Contact",
  intro: strings.contact?.intro ?? "",
  projectTypes: safeProjectTypes,
  budgets: safeBudgets,
  submit: appConfig.contact?.submit ?? "Send message",
  submitting: appConfig.contact?.submitting ?? "Sending…",
  success: {
    title: appConfig.contact?.successTitle ?? "Message received.",
    body: strings.contact?.success?.body ?? "Thank you for reaching out.",
    reset: strings.contact?.success?.reset ?? "Send another message",
  },
  error: strings.contact?.error ?? "Something went wrong. Please try again.",
  stageCaption: strings.contact?.stageCaption ?? "Your project is next.",
} as const;

export const portfolio = {
  eyebrow: strings.portfolio?.eyebrow ?? appConfig.portfolio.eyebrow,
  title: strings.portfolio?.title ?? appConfig.portfolio.title,
  intro: strings.portfolio?.intro ?? appConfig.portfolio.intro,
  filters: appConfig.portfolio.filters,
  projects: appConfig.portfolio.projects,
} as const;

export interface ReviewHighlight {
  value: string;
  label: string;
}

export interface ReviewItem {
  id?: string;
  name: string;
  role?: string;
  company?: string;
  rating?: number;
  quote: string;
  project?: string;
  date?: string;
  avatar?: string;
  verified?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  experience: string;
  bio: string;
  impact: string;
  skills: readonly string[];
  social: {
    linkedin?: string;
    email?: string;
    github?: string;
  };
}

export const reviews = {
  eyebrow: strings.reviews?.eyebrow ?? appConfig.reviews.eyebrow,
  title: strings.reviews?.title ?? appConfig.reviews.title,
  intro: strings.reviews?.intro ?? appConfig.reviews.intro,
  averageRating: appConfig.reviews.averageRating,
  totalReviews: appConfig.reviews.totalReviews,
  highlights: appConfig.reviews.highlights as unknown as readonly ReviewHighlight[],
  items: appConfig.reviews.items as unknown as readonly ReviewItem[],
} as const;

export const team = {
  eyebrow: strings.team?.eyebrow ?? appConfig.team.eyebrow,
  title: strings.team?.title ?? appConfig.team.title,
  intro: strings.team?.intro ?? appConfig.team.intro,
  values: appConfig.team.values,
  members: appConfig.team.members as unknown as readonly TeamMember[],
} as const;

export const footer = {
  tagline: strings.footer?.tagline ?? "",
  blurb: strings.footer?.blurb ?? "",
  copyright: strings.footer?.copyright ?? "",
} as const;
