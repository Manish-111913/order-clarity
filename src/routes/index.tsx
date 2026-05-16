import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KotCard, useElapsedSeconds, type KotStatus } from "@/components/KotCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chef Dashboard — Live KOT Queue" },
      {
        name: "description",
        content:
          "Live kitchen order tickets with aging timers, modifiers, allergy alerts, and preparation state tracking.",
      },
    ],
  }),
});

interface KotState {
  tableNo: string;
  kotId: string;
  startISO: string;
  status: KotStatus;
  allergyAlert?: string;
  staff: string;
  station: string;
  items: Array<{
    qty: number;
    name: string;
    modifiers?: Array<{ type: "exclude" | "add" | "note"; text: string }>;
  }>;
}

const INITIAL: KotState[] = [
  {
    tableNo: "T-04",
    kotId: "#001",
    startISO: new Date(Date.now() - 176 * 1000).toISOString(),
    status: "PENDING",
    allergyAlert: "EGGS — separate platter",
    staff: "Rahul S.",
    station: "Main Tandoor",
    items: [
      {
        qty: 2,
        name: "Chicken Biryani",
        modifiers: [
          { type: "exclude", text: "No Onion" },
          { type: "add", text: "Extra Raita" },
        ],
      },
      {
        qty: 1,
        name: "Chilli Chicken",
        modifiers: [{ type: "add", text: "Make it Extra Spicy" }],
      },
      { qty: 3, name: "Butter Naan" },
    ],
  },
  {
    tableNo: "T-09",
    kotId: "#002",
    startISO: new Date(Date.now() - 12 * 60 * 1000 - 15 * 1000).toISOString(),
    status: "PREPARING",
    staff: "Aisha K.",
    station: "Wok Station",
    items: [
      {
        qty: 1,
        name: "Paneer Tikka Masala",
        modifiers: [
          { type: "note", text: "Medium spice" },
          { type: "add", text: "Extra cashew" },
        ],
      },
      { qty: 2, name: "Garlic Naan" },
    ],
  },
  {
    tableNo: "T-02",
    kotId: "#003",
    startISO: new Date(Date.now() - 16 * 60 * 1000 - 40 * 1000).toISOString(),
    status: "PENDING",
    allergyAlert: "PEANUTS",
    staff: "Vikram P.",
    station: "Main Tandoor",
    items: [
      {
        qty: 1,
        name: "Pad Thai",
        modifiers: [
          { type: "exclude", text: "No peanuts" },
          { type: "exclude", text: "No fish sauce" },
        ],
      },
    ],
  },
];

function Index() {
  const [tickets, setTickets] = useState<KotState[]>(INITIAL);

  const update = (id: string, patch: Partial<KotState>) =>
    setTickets((t) => t.map((k) => (k.kotId === id ? { ...k, ...patch } : k)));

  const dismiss = (id: string) =>
    setTickets((t) => t.filter((k) => k.kotId !== id));

  return (
    <main className="min-h-screen bg-kot-bg px-4 py-8 md:px-8">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-kot-ink">Chef Dashboard</h1>
        <p className="text-sm text-kot-muted">
          Live KOT queue · {tickets.length} active ticket
          {tickets.length === 1 ? "" : "s"}
        </p>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tickets.map((t) => (
          <TickingCard
            key={t.kotId}
            ticket={t}
            onStart={() => update(t.kotId, { status: "PREPARING" })}
            onReady={() => {
              update(t.kotId, { status: "SERVED" });
              setTimeout(() => dismiss(t.kotId), 1200);
            }}
            onDismiss={() => dismiss(t.kotId)}
          />
        ))}
        {tickets.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-kot-border bg-kot-card/60 p-12 text-center text-kot-muted">
            All tickets cleared. Waiting for next order…
          </div>
        )}
      </section>
    </main>
  );
}

function TickingCard({
  ticket,
  onStart,
  onReady,
  onDismiss,
}: {
  ticket: KotState;
  onStart: () => void;
  onReady: () => void;
  onDismiss: () => void;
}) {
  const elapsed = useElapsedSeconds(ticket.startISO);
  return (
    <KotCard
      tableNo={ticket.tableNo}
      kotId={ticket.kotId}
      elapsedSeconds={elapsed}
      items={ticket.items}
      allergyAlert={ticket.allergyAlert}
      staff={ticket.staff}
      station={ticket.station}
      status={ticket.status}
      onStart={onStart}
      onReady={onReady}
      onDismiss={onDismiss}
    />
  );
}
