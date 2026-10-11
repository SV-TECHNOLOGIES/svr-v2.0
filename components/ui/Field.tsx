"use client";

/** Form fields with floating labels, accessible errors, and soft depth. */

import {
  useId,
  type InputHTMLAttributes,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "./icons";

interface Common {
  label: string;
  error?: string;
  optional?: boolean;
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  return (
    <p id={id} className="field-error" aria-live="polite">
      {error}
    </p>
  );
}

function Label({
  htmlFor,
  label,
  optional,
  floated,
}: {
  htmlFor: string;
  label: string;
  optional?: boolean;
  floated?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={`field-label ${floated ? "field-label-floated" : ""}`}>
      {label}
      {optional && <span className="text-muted/80 ml-1 font-normal">(optional)</span>}
    </label>
  );
}

export function TextField({
  label,
  error,
  optional,
  className = "",
  ref,
  ...props
}: Common & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`field ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className="field-control peer h-14"
          {...props}
        />
        <Label htmlFor={id} label={label} optional={optional} />
      </div>
      <ErrorText id={errId} error={error} />
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  optional,
  className = "",
  ref,
  ...props
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`field ${className}`}>
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          rows={5}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className="field-control peer min-h-36 resize-y pt-7"
          {...props}
        />
        <Label htmlFor={id} label={label} optional={optional} />
      </div>
      <ErrorText id={errId} error={error} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  options,
  placeholder = "Select…",
  className = "",
  ref,
  ...props
}: Common &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: readonly string[];
    placeholder?: string;
    ref?: Ref<HTMLSelectElement>;
  }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`field ${className}`}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className="field-control h-14 cursor-pointer appearance-none pr-10"
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Label htmlFor={id} label={label} floated />
        <ChevronDown className="text-muted pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
      </div>
      <ErrorText id={errId} error={error} />
    </div>
  );
}
