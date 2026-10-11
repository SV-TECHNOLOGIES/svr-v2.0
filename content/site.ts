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
  name: appConfig.site.name,
  shortName: appConfig.site.shortName,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? appConfig.site.defaultUrl,
  positioning: strings.site.positioning,
  seo: {
    title: strings.site.seo.title,
    description: strings.site.seo.description,
    keywords: appConfig.site.keywords,
  },
  /**
   * Logo. Leave `src` as null to use the built-in placeholder mark.
   * When the real logo arrives: drop it in /public/logo/ and set `src`,
   * e.g. "/logo/svr-logo.svg", plus its intrinsic width/height.
   */
  logo: {
    src: appConfig.site.logo.src as string | null,
    width: appConfig.site.logo.width,
    height: appConfig.site.logo.height,
    alt: appConfig.site.logo.alt,
  },
  contact: {
    email: appConfig.site.contact.email,
    phone: appConfig.site.contact.phone,
    phoneHref: appConfig.site.contact.phoneHref,
    whatsapp: appConfig.site.contact.whatsapp,
    whatsappHref: appConfig.site.contact.whatsappHref,
    location: strings.site.contact.location,
    city: appConfig.site.contact.city,
    region: appConfig.site.contact.region,
    country: appConfig.site.contact.country,
    replyTime: strings.site.contact.replyTime,
    replyTimeTodo: appConfig.site.contact.replyTimeTodo,
  },
  social: appConfig.site.social as readonly {
    label: string;
    href: string;
    icon: "linkedin" | "instagram";
  }[],
} as const;

export const nav = {
  links: appConfig.nav.links,
  cta: appConfig.nav.cta,
} as const;

export const hero = {
  eyebrow: strings.hero.eyebrow,
  /** Each entry is one headline line; `highlight` parts get the blue gradient. */
  headline: [
    [{ text: strings.hero.headline.part1 }, { text: strings.hero.headline.part2, highlight: true }],
    [{ text: strings.hero.headline.part3 }],
  ],
  subtext: strings.hero.subtext,
  primaryCta: appConfig.hero.primaryCta,
  secondaryCta: { label: strings.hero.secondaryCta, href: appConfig.hero.secondaryCta.href },
  chips: appConfig.hero.chips,
  scrollHint: appConfig.hero.scrollHint,
} as const;

export const howWeBuild = {
  eyebrow: strings.howWeBuild.eyebrow,
  title: strings.howWeBuild.title,
  intro: strings.howWeBuild.intro,
  steps: [
    {
      number: appConfig.howWeBuild.steps[0].number,
      title: appConfig.howWeBuild.steps[0].title,
      body: strings.howWeBuild.steps[0].body,
      points: [
        appConfig.howWeBuild.steps[0].points[0],
        strings.howWeBuild.steps[0].points[0],
        strings.howWeBuild.steps[0].points[1],
      ],
    },
    {
      number: appConfig.howWeBuild.steps[1].number,
      title: appConfig.howWeBuild.steps[1].title,
      body: strings.howWeBuild.steps[1].body,
      points: [
        strings.howWeBuild.steps[1].points[0],
        appConfig.howWeBuild.steps[1].points[0],
        strings.howWeBuild.steps[1].points[1],
      ],
    },
    {
      number: appConfig.howWeBuild.steps[2].number,
      title: strings.howWeBuild.steps[2].title,
      body: strings.howWeBuild.steps[2].body,
      points: [
        appConfig.howWeBuild.steps[2].points[0],
        strings.howWeBuild.steps[2].points[0],
        appConfig.howWeBuild.steps[2].points[1],
      ],
    },
    {
      number: appConfig.howWeBuild.steps[3].number,
      title: strings.howWeBuild.steps[3].title,
      body: strings.howWeBuild.steps[3].body,
      points: [
        strings.howWeBuild.steps[3].points[0],
        strings.howWeBuild.steps[3].points[1],
        strings.howWeBuild.steps[3].points[2],
      ],
    },
    {
      number: appConfig.howWeBuild.steps[4].number,
      title: strings.howWeBuild.steps[4].title,
      body: strings.howWeBuild.steps[4].body,
      points: [
        appConfig.howWeBuild.steps[4].points[0],
        strings.howWeBuild.steps[4].points[0],
        appConfig.howWeBuild.steps[4].points[1],
      ],
    },
  ],
  /** Small live labels shown beside the lattice during steps 03–05. */
  indicators: {
    build: strings.howWeBuild.indicators.build,
    qa: appConfig.howWeBuild.indicators.qa,
    launch: appConfig.howWeBuild.indicators.launch,
  },
} as const;

export const impact = {
  eyebrow: "Impact",
  title: strings.impact.title,
  stats: appConfig.impact.stats,
  outcome: strings.impact.outcome,
} as const;

export type ServiceIcon = "browser" | "phone" | "agent" | "workflow";

export const services = {
  eyebrow: "Services",
  title: strings.services.title,
  intro: strings.services.intro,
  items: [
    {
      icon: appConfig.services.items[0].icon as ServiceIcon,
      title: appConfig.services.items[0].title,
      body: strings.services.items.websites.body,
      tags: appConfig.services.items[0].tags,
    },
    {
      icon: appConfig.services.items[1].icon as ServiceIcon,
      title: appConfig.services.items[1].title,
      body: strings.services.items.mobileApps.body,
      tags: [strings.services.items.mobileApps.tags[0], ...appConfig.services.items[1].tags],
    },
    {
      icon: appConfig.services.items[2].icon as ServiceIcon,
      title: appConfig.services.items[2].title,
      body: strings.services.items.aiAgents.body,
      tags: [
        strings.services.items.aiAgents.tags[0],
        strings.services.items.aiAgents.tags[1],
        ...appConfig.services.items[2].tags,
      ],
    },
    {
      icon: appConfig.services.items[3].icon as ServiceIcon,
      title: strings.services.items.aiWorkflowAutomation.title,
      body: strings.services.items.aiWorkflowAutomation.body,
      tags: [
        appConfig.services.items[3].tags[0],
        strings.services.items.aiWorkflowAutomation.tags[0],
        appConfig.services.items[3].tags[1],
      ],
    },
  ],
} as const;

export const testimonials = {
  eyebrow: "Testimonials",
  title: strings.testimonials.title,
  viewMore: appConfig.testimonials.viewMore,
  items: [
    {
      quote: strings.testimonials.items[0].quote,
      name: appConfig.testimonials.items[0].name,
      role: appConfig.testimonials.items[0].role,
      company: appConfig.testimonials.items[0].company,
      rating: appConfig.testimonials.items[0].rating,
      todo: appConfig.testimonials.items[0].todo,
    },
    {
      quote: strings.testimonials.items[1].quote,
      name: appConfig.testimonials.items[1].name,
      role: strings.testimonials.items[1].role,
      company: appConfig.testimonials.items[1].company,
      rating: appConfig.testimonials.items[1].rating,
      todo: appConfig.testimonials.items[1].todo,
    },
    {
      quote: strings.testimonials.items[2].quote,
      name: appConfig.testimonials.items[2].name,
      role: appConfig.testimonials.items[2].role,
      company: appConfig.testimonials.items[2].company,
      rating: appConfig.testimonials.items[2].rating,
      todo: appConfig.testimonials.items[2].todo,
    },
    {
      quote: strings.testimonials.items[3].quote,
      name: appConfig.testimonials.items[3].name,
      role: appConfig.testimonials.items[3].role,
      company: appConfig.testimonials.items[3].company,
      rating: appConfig.testimonials.items[3].rating,
      todo: appConfig.testimonials.items[3].todo,
    },
  ],
} as const;

export const contact = {
  eyebrow: "Contact",
  title: strings.contact.title,
  intro: strings.contact.intro,
  projectTypes: appConfig.contact.projectTypes as unknown as readonly [
    string,
    ...string[],
  ],
  budgets: [
    strings.contact.budgets.under1Lakh,
    appConfig.contact.budgets[0],
    appConfig.contact.budgets[1],
    appConfig.contact.budgets[2],
    strings.contact.budgets.notSureYet,
  ] as const,
  submit: appConfig.contact.submit,
  submitting: appConfig.contact.submitting,
  success: {
    title: appConfig.contact.successTitle,
    body: strings.contact.success.body,
    reset: strings.contact.success.reset,
  },
  error: strings.contact.error,
  stageCaption: strings.contact.stageCaption,
} as const;

export const portfolio = {
  eyebrow: strings.portfolio?.eyebrow ?? appConfig.portfolio.eyebrow,
  title: strings.portfolio?.title ?? appConfig.portfolio.title,
  intro: strings.portfolio?.intro ?? appConfig.portfolio.intro,
  filters: appConfig.portfolio.filters,
  projects: appConfig.portfolio.projects,
} as const;

export const reviews = {
  eyebrow: strings.reviews?.eyebrow ?? appConfig.reviews.eyebrow,
  title: strings.reviews?.title ?? appConfig.reviews.title,
  intro: strings.reviews?.intro ?? appConfig.reviews.intro,
  averageRating: appConfig.reviews.averageRating,
  totalReviews: appConfig.reviews.totalReviews,
  highlights: appConfig.reviews.highlights,
  items: appConfig.reviews.items,
} as const;

export const team = {
  eyebrow: strings.team?.eyebrow ?? appConfig.team.eyebrow,
  title: strings.team?.title ?? appConfig.team.title,
  intro: strings.team?.intro ?? appConfig.team.intro,
  values: appConfig.team.values,
  members: appConfig.team.members,
} as const;

export const footer = {
  tagline: strings.footer.tagline,
  blurb: strings.footer.blurb,
  copyright: strings.footer.copyright,
} as const;
