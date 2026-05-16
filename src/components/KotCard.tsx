import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type KotStatus = "PENDING" | "PREPARING" | "SERVED";

export interface KotModifier {
  type: "exclude" | "add" | "note";
  text: string;
}

export interface KotItem {
  qty: number;
  name: string;
  modifiers?: KotModifier[];
}

export interface KotCardProps {
  tableNo: string;
  kotId: string;
  /** seconds elapsed since KOT was fired */
  elapsedSeconds: number;
  items: KotItem[];
  allergyAlert?: string;
  staff?: string;
  station?: string;
  status: KotStatus;
  onStart?: () => void;
  onReady?: () => void;
  onDismiss?: () => void;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function timerTone(sec: number) {
  const minutes = sec / 60;
  if (minutes <= 10) return "neutral";
  if (minutes <= 15) return "warning";
  return "critical";
}

export function KotCard({
  tableNo,
  kotId,
  elapsedSeconds,
  items,
  allergyAlert,
  staff,
  station,
  status,
  onStart,
  onReady,
  onDismiss,
}: KotCardProps) {
  const tone = timerTone(elapsedSeconds);

  return (
    <article className="w-full max-w-md rounded-2xl bg-kot-card shadow-kot ring-1 ring-kot-border overflow-hidden font-mono">
      {/* Header */}
      <header className="flex items-stretch justify-between gap-4 px-5 py-4 border-b border-dashed border-kot-border bg-kot-header">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight text-kot-ink leading-none">
            {tableNo}
          </span>
          <span className="text-xs uppercase tracking-widest text-kot-muted">
            Table
          </span>
          <span className="mx-2 h-6 w-px bg-kot-border" />
          <span className="text-sm font-semibold text-kot-ink">{kotId}</span>
          <span className="text-[10px] uppercase tracking-widest text-kot-muted">
            KOT
          </span>
        </div>

        <div className="flex flex-col items-end leading-none">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              tone === "neutral" && "text-kot-muted",
              tone === "warning" && "text-kot-warning",
              tone === "critical" && "text-kot-critical animate-pulse",
            )}
          >
            {formatTime(elapsedSeconds)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-kot-muted">
            {status === "PENDING" && "Status: Pending"}
            {status === "PREPARING" && "Status: Preparing"}
            {status === "SERVED" && "Status: Served"}
          </span>
        </div>
      </header>

      {/* Allergy alert */}
      {allergyAlert && (
        <div className="mx-5 mt-4 rounded-md border border-kot-critical/40 bg-kot-critical/10 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wider text-kot-critical">
            ⚠ Allergy Alert: {allergyAlert}
          </p>
        </div>
      )}

      {/* Items matrix */}
      <section className="px-5 py-4">
        <div className="flex items-center justify-between border-b border-kot-border pb-2 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-kot-muted">
            Qty
          </span>
          <span className="text-[10px] uppercase tracking-widest text-kot-muted">
            Item & Specifications
          </span>
        </div>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 shrink-0 text-base font-bold tabular-nums text-kot-ink">
                {item.qty.toString().padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-base font-semibold text-kot-ink leading-tight">
                  {item.name}
                </p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {item.modifiers.map((mod, mi) => (
                      <li
                        key={mi}
                        className={cn(
                          "text-xs leading-relaxed",
                          mod.type === "exclude" && "text-kot-critical/90",
                          mod.type === "add" && "text-kot-add",
                          mod.type === "note" && "text-kot-muted italic",
                        )}
                      >
                        {mod.type === "exclude" && (
                          <span className="font-bold">[−] </span>
                        )}
                        {mod.type === "add" && (
                          <span className="font-bold">[+] </span>
                        )}
                        {mod.type === "note" && (
                          <span className="font-bold">[!] </span>
                        )}
                        {mod.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Meta */}
      {(staff || station) && (
        <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-kot-muted border-t border-dashed border-kot-border pt-3">
          {staff && (
            <span>
              <span className="uppercase tracking-wider">Handler:</span>{" "}
              <span className="font-semibold text-kot-ink">{staff}</span>
            </span>
          )}
          {station && (
            <span>
              <span className="uppercase tracking-wider">Station:</span>{" "}
              <span className="font-semibold text-kot-ink">{station}</span>
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <footer className="flex items-stretch gap-2 px-5 pb-5 pt-1">
        <button
          onClick={onDismiss}
          aria-label="Reject or dismiss"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-kot-border bg-kot-card text-kot-critical transition hover:bg-kot-critical/10"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>

        {status === "PENDING" && (
          <button
            onClick={onStart}
            className="flex-1 rounded-lg bg-kot-action text-kot-action-foreground font-semibold uppercase tracking-wider text-sm transition hover:brightness-95 active:brightness-90"
          >
            Start Preparation
          </button>
        )}
        {status === "PREPARING" && (
          <button
            onClick={onReady}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-kot-ready text-white font-semibold uppercase tracking-wider text-sm transition hover:brightness-95 active:brightness-90"
          >
            <Check className="h-5 w-5" strokeWidth={3} />
            Mark as Ready
          </button>
        )}
        {status === "SERVED" && (
          <div className="flex-1 inline-flex items-center justify-center rounded-lg bg-kot-ready/10 text-kot-ready font-semibold uppercase tracking-wider text-sm">
            ✓ Served
          </div>
        )}
      </footer>
    </article>
  );
}

/** Hook to drive an auto-ticking elapsed counter from an ISO start time. */
export function useElapsedSeconds(startISO: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, Math.floor((now - new Date(startISO).getTime()) / 1000));
}
