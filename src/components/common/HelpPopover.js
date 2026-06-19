"use client";
import { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A small "?" button that opens an explanatory popover on click.
 * Closes on outside click or Escape. Title/body are plain strings (caller
 * handles localization).
 */
export default function HelpPopover({ title, children, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label="Help"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-4" />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-1/2 top-6 z-50 w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-soft animate-fade-up"
        >
          <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-popover" />
          <div className="flex items-start justify-between gap-2">
            {title && <p className="text-sm font-bold leading-tight">{title}</p>}
            <button type="button" onClick={() => setOpen(false)} className="-mr-1 -mt-0.5 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</div>
        </div>
      )}
    </span>
  );
}
