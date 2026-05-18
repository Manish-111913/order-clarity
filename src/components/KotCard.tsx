import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
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
  elapsedSeconds: number;
  items: KotItem[];
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

const STAGES: { key: KotStatus; label: string }[] = [
  { key: "PENDING", label: "Queued" },
  { key: "PREPARING", label: "Cooking" },
  { key: "SERVED", label: "Ready" },
];

export function KotCard({
  tableNo,
  kotId,
  elapsedSeconds,
  items,
  staff,
  station,
  status,
  onStart,
  onReady,
  onDismiss,
}: KotCardProps) {
  const tone = timerTone(elapsedSeconds);
  const stageIndex = STAGES.findIndex((s) => s.key === status);

  const advance = status === "PENDING" ? onStart : status === "PREPARING" ? onReady : undefined;
  const ctaLabel =
    status === "PENDING" ? "Start Cooking" : status === "PREPARING" ? "Mark Ready" : "Served";

  return (
    <article className="w-full max-w-md rounded-2xl bg-kot-card shadow-kot ring-1 ring-kot-border overflow-hidden font-mono">
      {/* Header — minimal: status dot · table · spacer · timer · dismiss */}
      <header className="relative px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* status dot */}
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              status === "PENDING" && "bg-kot-muted",
              status === "PREPARING" && "bg-kot-warning animate-pulse",
              status === "SERVED" && "bg-kot-ready",
            )}
            aria-hidden
          />

          {/* table — the hero */}
          <h2 className="text-4xl font-bold leading-none tracking-tight text-kot-ink">
            {tableNo}
          </h2>

          {/* kot id — small, secondary */}
          <span className="self-end pb-0.5 text-xs font-medium tracking-wide text-kot-muted">
            {kotId}
          </span>

          {/* timer pushed right */}
          <span
            className={cn(
              "ml-auto text-2xl font-semibold tabular-nums leading-none",
              tone === "neutral" && "text-kot-ink/70",
              tone === "warning" && "text-kot-warning",
              tone === "critical" && "text-kot-critical animate-pulse",
            )}
          >
            {formatTime(elapsedSeconds)}
          </span>

          <button
            onClick={onDismiss}
            aria-label="Dismiss ticket"
            className="flex h-6 w-6 items-center justify-center rounded-full text-kot-muted/60 transition hover:bg-kot-critical/10 hover:text-kot-critical"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* sub-row: tiny labels aligned under their values */}
        <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-kot-muted">
          <span className="w-2" aria-hidden />
          <span>Table</span>
          <span className="text-kot-border">/</span>
          <span>
            {status === "PENDING" && "Awaiting"}
            {status === "PREPARING" && "In progress"}
            {status === "SERVED" && "Served"}
          </span>
          <span className="ml-auto mr-9">Elapsed</span>
        </div>

        {/* hairline divider */}
        <div className="mt-4 h-px bg-kot-border" />
      </header>

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
        <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-kot-muted">
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

      {/* NEW Footer concept: perforated ticket stub with stage track + advance CTA */}
      <div className="relative">
        {/* Perforation row with notches */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-kot-bg"
          />
          <div
            aria-hidden
            className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-kot-bg"
          />
          <div className="mx-5 border-t border-dashed border-kot-border" />
        </div>

        <footer className="px-5 pt-4 pb-5 bg-kot-stub">
          {/* Stage track */}
          <ol className="flex items-center gap-2 mb-4" aria-label="Order stage">
            {STAGES.map((stage, i) => {
              const isComplete = i < stageIndex;
              const isCurrent = i === stageIndex;
              return (
                <li key={stage.key} className="flex flex-1 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition",
                        isComplete && "bg-kot-ready text-white",
                        isCurrent && "bg-kot-ink text-kot-card ring-2 ring-kot-ink/20",
                        !isComplete && !isCurrent && "bg-kot-border text-kot-muted",
                      )}
                    >
                      {isComplete ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-widest",
                        isCurrent ? "text-kot-ink font-bold" : "text-kot-muted",
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <span
                      className={cn(
                        "h-px flex-1",
                        i < stageIndex ? "bg-kot-ready" : "bg-kot-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Advance CTA — full-width pill with arrow that slides on hover */}
          <button
            onClick={advance}
            disabled={!advance}
            className={cn(
              "group relative flex w-full items-center justify-between overflow-hidden rounded-full px-5 py-3 text-sm font-bold uppercase tracking-widest transition",
              status === "PENDING" &&
                "bg-kot-ink text-kot-card hover:bg-kot-ink/90",
              status === "PREPARING" &&
                "bg-kot-ready text-white hover:brightness-110",
              status === "SERVED" &&
                "bg-kot-ready/15 text-kot-ready cursor-default",
            )}
          >
            <span className="flex items-center gap-2">
              {status === "SERVED" && <Check className="h-4 w-4" strokeWidth={3} />}
              {ctaLabel}
            </span>
            {status !== "SERVED" && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            )}
          </button>
        </footer>
      </div>
    </article>
  );
}

export function useElapsedSeconds(startISO: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, Math.floor((now - new Date(startISO).getTime()) / 1000));
}
