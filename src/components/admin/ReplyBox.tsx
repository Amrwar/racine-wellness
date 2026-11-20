"use client";

import { useActionState, useState } from "react";
import { replyToMessage, type SettingsState } from "@/app/admin/actions";
import { input } from "./fields";

/** Write and send an email reply to a contact-form message without leaving the admin. */
export function ReplyBox({ id, name, locale }: { id: number; name: string; locale: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SettingsState, FormData>(replyToMessage, { status: "idle" });
  const first = name.split(" ")[0];
  const greeting = locale === "fr" ? `Bonjour ${first},\n\n` : `Hello ${first},\n\n`;
  const signature = locale === "fr" ? "\n\nAu plaisir,\nZiad, HealthyZone" : "\n\nBest regards,\nZiad, HealthyZone";

  if (state.status === "saved") return <p className="text-sm font-medium text-[#007a43]">{state.message}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-blue-dark px-4 py-2 text-sm font-semibold text-white hover:bg-[#00649f]">
        Reply by email
      </button>
    );
  }
  return (
    <form action={action} className="w-full space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea name="reply" rows={8} required defaultValue={`${greeting}${signature}`} className={`${input} resize-y leading-relaxed`} autoFocus />
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={pending} className="rounded-full bg-blue-dark px-5 py-2 text-sm font-semibold text-white hover:bg-[#00649f] disabled:opacity-50">
          {pending ? "Sending…" : "Send reply"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-navy">
          Cancel
        </button>
        {state.status === "error" && <span className="text-sm text-danger">{state.message}</span>}
        <span className="text-xs text-muted-foreground">Their replies come back to your inbox.</span>
      </div>
    </form>
  );
}
