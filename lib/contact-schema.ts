import { z } from "zod";
import { contact } from "@/content/site";
import strings from "@/strings.json";

/** Shared by the client form (inline validation) and the API route. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: strings.contact.validation.nameRequired })
    .max(80, { error: strings.contact.validation.nameTooLong }),
  email: z
    .string()
    .trim()
    .min(1, { error: strings.contact.validation.emailRequired })
    .max(120, { error: strings.contact.validation.emailTooLong })
    .pipe(z.email({ error: strings.contact.validation.emailInvalid })),
  phone: z
    .string()
    .trim()
    .max(20, { error: strings.contact.validation.phoneTooLong })
    .refine((v) => v === "" || /^[+()\d\s-]{7,20}$/.test(v), {
      error: strings.contact.validation.phoneInvalid,
    }),
  company: z.string().trim().max(100, { error: strings.contact.validation.companyTooLong }),
  projectType: z.enum(contact.projectTypes, { error: strings.contact.validation.projectTypeRequired }),
  budget: z.enum(contact.budgets, { error: strings.contact.validation.budgetRequired }),
  message: z
    .string()
    .trim()
    .min(20, { error: strings.contact.validation.messageTooShort })
    .max(4000, { error: strings.contact.validation.messageTooLong }),
  /** Honeypot — real people never see or fill this field. */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
