"use client";

import { useActionState } from "react";
import { updateClientNotes, type SettingsState } from "@/app/admin/actions";
import { Section, input } from "./fields";

/** Private notes about a client (never shown to them). */
export function ClientNotes({ clientKey, initial }: { clientKey: string; initial: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateClientNotes, { status: "idle" });
  return (
    <form action={action}>
      <Section title="Private notes" text="Only you can see these: preferences, areas to work on, health notes.">
        <input type="hidden" name="key" value={clientKey} />
        <textarea
          name="notes"
          rows={5}
          defaultValue={initial}
          maxLength={5000}
          className={`${input} resize-y leading-relaxed`}
          placeholder="e.g. Lower back tension, prefers firm pressure, allergic to nut oils."
        />
        <div className="flex items-center justify-between gap-3">
          <p role="status" className={`text-sm ${state.status === "error" ? "text-danger" : "text-[#007a43]"}`}>
            {state.message}
          </p>
          <button disabled={pending} className="rounded-full bg-blue-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#00649f] disabled:opacity-50">
            {pending ? "Saving…" : "Save notes"}
          </button>
        </div>
      </Section>
    </form>
  );
}
