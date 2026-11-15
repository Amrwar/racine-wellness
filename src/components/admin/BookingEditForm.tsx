"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { editBooking, type EditBookingState } from "@/app/admin/actions";
import type { Booking } from "@/lib/booking-data";
import type { PricedService } from "@/lib/pricing-data";

const input =
  "w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/15";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-mist/60 sm:p-7">
      <h2 className="mb-5 text-lg font-semibold text-navy">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function BookingEditForm({
  booking,
  date,
  time,
  services,
}: {
  booking: Booking;
  date: string;
  time: string;
  services: PricedService[];
}) {
  const [serviceId, setServiceId] = useState(services.some((s) => s.id === booking.service_id) ? booking.service_id : "");
  const [minutes, setMinutes] = useState(booking.minutes);
  const [price, setPrice] = useState(String(booking.price));
  const [location, setLocation] = useState(booking.location);
  const [email, setEmail] = useState(booking.email ?? "");
  const [state, action, pending] = useActionState<EditBookingState, FormData>(editBooking, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  // Any edit after a warning means the time must be checked again before saving.
  const [editedAfter, setEditedAfter] = useState<EditBookingState | null>(null);
  const warning = state.status === "warn" && editedAfter !== state;
  const service = services.find((s) => s.id === serviceId);

  /** Picking a treatment or length suggests its list price; it can still be changed by hand. */
  const suggest = (s: PricedService | undefined, m: number) => {
    const rate = s?.rates.find((r) => r.minutes === m);
    if (rate) setPrice(String(rate.price));
  };

  const submit = (force: boolean) => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    data.set("force", force ? "yes" : "no");
    startTransition(() => action(data));
  };

  return (
    <form
      ref={formRef}
      className="space-y-6 pb-32"
      onChange={() => setEditedAfter(state)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
    >
      <input type="hidden" name="id" value={booking.id} />

      <Section title="Date and time">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date">
            <input type="date" name="date" defaultValue={date} required className={input} />
          </Field>
          <Field label="Start time">
            <input type="time" name="time" defaultValue={time} step={300} required className={input} />
          </Field>
          <Field label="Length">
            <span className="relative block">
              <input
                type="number"
                name="minutes"
                min={15}
                max={600}
                step={5}
                value={minutes}
                onChange={(e) => {
                  setMinutes(Number(e.target.value));
                  suggest(service, Number(e.target.value));
                }}
                className={`${input} pr-12`}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">min</span>
            </span>
          </Field>
        </div>
      </Section>

      <Section title="Treatment and price">
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <Field label="Treatment">
            <select
              name="service"
              value={serviceId}
              onChange={(e) => {
                const s = services.find((x) => x.id === e.target.value);
                setServiceId(e.target.value);
                suggest(s, minutes);
              }}
              className={input}
            >
              {!serviceId && <option value="">{booking.service_title}</option>}
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price">
            <span className="relative block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
              <input type="number" name="price" min={0} max={10000} step="any" value={price} onChange={(e) => setPrice(e.target.value)} className={`${input} pl-8`} />
            </span>
          </Field>
        </div>
        {service && (
          <p className="text-sm text-muted">
            List prices: {service.rates.map((r) => `${r.minutes} min $${r.price}`).join(" · ")}. Choosing a length from this list fills in its price.
          </p>
        )}
      </Section>

      <Section title="Location">
        <div className="flex flex-wrap gap-3">
          {(["office", "home"] as const).map((loc) => (
            <label
              key={loc}
              className={`cursor-pointer rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${
                location === loc ? "border-blue bg-blue/5 text-navy" : "border-mist/70 text-muted hover:border-blue/50"
              }`}
            >
              <input type="radio" name="location" value={loc} checked={location === loc} onChange={() => setLocation(loc)} className="sr-only" />
              {loc === "office" ? "Office, Saint-Jean" : "Home visit"}
            </label>
          ))}
        </div>
        {location === "home" && (
          <Field label="Address">
            <input name="address" defaultValue={booking.address ?? ""} className={input} />
          </Field>
        )}
      </Section>

      <Section title="Client">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" defaultValue={booking.name} className={input} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" defaultValue={booking.phone} className={input} />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea name="notes" rows={3} defaultValue={booking.notes ?? ""} className={`${input} resize-y`} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="receipt" value="yes" defaultChecked={booking.wants_receipt} className="h-4 w-4 accent-navy" />
          Insurance receipt requested
        </label>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist/70 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto max-w-5xl space-y-3 px-5 py-4 sm:px-8">
          {state.status === "error" && (
            <ul role="alert" className="rounded-xl bg-danger/8 px-4 py-2.5 text-sm text-danger">
              {state.errors?.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
          {warning && (
            <div role="alert" className="rounded-xl bg-[#fff6e5] px-4 py-3 text-sm text-[#7a4b00] ring-1 ring-[#f0c36d]">
              <p className="font-semibold">Please check before saving:</p>
              <ul className="mt-1 list-disc pl-5">
                {state.warnings?.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className={`flex items-center gap-2 text-sm ${email ? "text-ink" : "text-muted"}`}>
              <input type="checkbox" name="notify" value="yes" defaultChecked disabled={!email} className="h-4 w-4 accent-navy" />
              Email the client the updated details
            </label>
            <div className="flex gap-2">
              <Link href="/admin/bookings" className="rounded-full px-4 py-2.5 text-sm font-medium text-muted hover:text-navy">
                Cancel
              </Link>
              {warning ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submit(true)}
                  className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Save anyway"}
                </button>
              ) : (
                <button
                  disabled={pending}
                  className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 hover:bg-[#00649f] disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
