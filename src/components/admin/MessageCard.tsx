import { Badge, Card, formatDate } from "./ui";
import { setMessageStatus } from "@/app/admin/actions";
import { DeleteMessage } from "./DeleteMessage";
import { ReplyBox } from "./ReplyBox";

export type Message = {
  id: number;
  created_at: string;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  wants_receipt: boolean;
  locale: string;
  status: "new" | "handled";
  reply?: string | null;
  replied_at?: string | null;
};

export function MessageCard({ m, compact = false }: { m: Message; compact?: boolean }) {
  const isNew = m.status === "new";
  return (
    <Card className={`p-5 sm:p-6 ${isNew ? "border-l-4 border-l-blue" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-navy">{m.name}</p>
          <p className="text-sm text-muted-foreground">{formatDate(m.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isNew ? <Badge tone="blue">New</Badge> : <Badge>Handled</Badge>}
          {m.wants_receipt && <Badge tone="green">Insurance receipt</Badge>}
          <Badge>{m.locale === "fr" ? "Français" : "English"}</Badge>
        </div>
      </div>

      {/* Compact cards sit inside a link (Overview), so they show plain text instead of nested links. */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {compact ? (
          <>
            <span className="font-medium text-blue-dark">{m.phone}</span>
            {m.email && <span className="font-medium text-blue-dark">{m.email}</span>}
          </>
        ) : (
          <>
            <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-blue-dark hover:underline">
              {m.phone}
            </a>
            {m.email && (
              <a href={`mailto:${m.email}`} className="font-medium text-blue-dark hover:underline">
                {m.email}
              </a>
            )}
          </>
        )}
      </div>

      {m.message && (
        <p className={`mt-4 whitespace-pre-line leading-relaxed text-ink ${compact ? "line-clamp-2" : ""}`}>{m.message}</p>
      )}

      {!compact && m.reply && (
        <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-mist/60">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Your reply{m.replied_at ? ` · ${formatDate(m.replied_at)}` : ""}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{m.reply}</p>
        </div>
      )}

      {!compact && m.email && (
        <div className="mt-4">
          <ReplyBox key={m.replied_at ?? "new"} id={m.id} name={m.name} locale={m.locale} />
        </div>
      )}

      {!compact && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-mist/60 pt-4">
          <form action={setMessageStatus}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="status" value={isNew ? "handled" : "new"} />
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isNew ? "bg-navy text-white hover:bg-navy-deep" : "bg-surface text-navy ring-1 ring-mist hover:bg-white"
              }`}
            >
              {isNew ? "Mark as handled" : "Mark as new"}
            </button>
          </form>
          <DeleteMessage id={m.id} />
        </div>
      )}
    </Card>
  );
}
