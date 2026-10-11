/** Dev-only marker for placeholder content. Renders nothing in production. */
export function TodoBadge({ show = true, label = "TODO" }: { show?: boolean; label?: string }) {
  if (!show || process.env.NODE_ENV === "production") return null;
  return (
    <span
      className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 align-middle font-sans text-[10px] font-semibold tracking-wider text-amber-800 ring-1 ring-amber-300"
      title="Placeholder content — replace before launch (see README)"
    >
      {label}
    </span>
  );
}
