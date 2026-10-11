"use client";

/**
 * Contact form: React Hook Form + Zod (same schema as the API route),
 * floating labels, inline errors announced to screen readers, honeypot,
 * loading state, and animated success/error states. On success the contact
 * lattice assembles fully with a soft pulse.
 */

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { contact, site } from "@/content/site";
import strings from "@/strings.json";
import { contactSchema, type ContactData, type ContactInput } from "@/lib/contact-schema";
import { setContactSuccess } from "@/lib/lattice-store";
import { EASE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { ArrowRight, Check } from "@/components/ui/icons";

type Status = "idle" | "success" | "error";

/** Time spent on the form (the API treats sub-2.5s submissions as bots). */
const elapsedSince = (start: number) => Date.now() - start;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string>("");
  const startedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      projectType: "" as ContactInput["projectType"],
      budget: "" as ContactInput["budget"],
      message: "",
      website: "",
    },
  });

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (data: ContactData) => {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, elapsedMs: elapsedSince(startedAt.current) }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || contact.error);
      setStatus("success");
      setContactSuccess(1);
      reset();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error && err.message ? err.message : contact.error);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            ref={successRef}
            tabIndex={-1}
            role="status"
            initial={{ opacity: 0, y: 24, z: -120, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, z: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex min-h-[520px] flex-col items-center justify-center rounded-[var(--radius-card)] p-8 text-center"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
              className="from-primary to-accent relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_16px_40px_-12px_rgb(29_78_216/0.7)]"
            >
              <span className="live-ping bg-accent/50 absolute inset-0 rounded-full" aria-hidden />
              <Check className="relative h-7 w-7" strokeWidth={2.4} />
            </motion.span>
            <h3 className="font-display text-h2 text-navy mt-6 font-semibold">
              {contact.success.title}
            </h3>
            <p className="text-muted mt-3 max-w-[40ch]">{contact.success.body}</p>
            <div className="mt-8">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus("idle");
                  setContactSuccess(0);
                }}
              >
                {contact.success.reset}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            // eslint-disable-next-line react-hooks/refs -- RHF's handleSubmit returns an event handler; refs are read on submit, not during render
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, z: -80 }}
            transition={{ duration: 0.5, ease: EASE }}
            aria-describedby="form-status"
            className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2"
          >
            <TextField
              label="Name"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              optional
              error={errors.phone?.message}
              {...register("phone")}
            />
            <TextField
              label="Company"
              autoComplete="organization"
              optional
              error={errors.company?.message}
              {...register("company")}
            />
            <SelectField
              label="Project type"
              options={contact.projectTypes}
              error={errors.projectType?.message}
              {...register("projectType")}
            />
            <SelectField
              label="Budget range"
              options={contact.budgets}
              error={errors.budget?.message}
              {...register("budget")}
            />
            <TextAreaField
              label={strings.contact.form.messageLabel}
              className="sm:col-span-2"
              error={errors.message?.message}
              {...register("message")}
            />

            {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>

            <div className="mt-3 flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p id="form-status" className="text-muted text-sm" aria-live="polite">
                {status === "error" ? (
                  <span className="text-red-700">
                    {serverError}{" "}
                    <a
                      className="font-medium underline underline-offset-4"
                      href={`mailto:${site.contact.email}`}
                    >
                      {site.contact.email}
                    </a>
                  </span>
                ) : submitCount > 0 && errorCount > 0 ? (
                  <span className="text-red-700">
                    Please check {errorCount === 1 ? "1 field" : `${errorCount} fields`} above.
                  </span>
                ) : (
                  strings.contact.form.privacy
                )}
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                iconAfter={
                  isSubmitting ? (
                    <span
                      aria-hidden
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
              >
                {isSubmitting ? contact.submitting : contact.submit}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
