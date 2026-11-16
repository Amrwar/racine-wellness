import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { discardDraft } from "@/lib/settings";
import { getTextOverrides } from "@/lib/content";
import { PageHeader } from "@/components/admin/ui";
import { TextEditor } from "@/components/admin/TextEditor";
import { WebsiteTabs } from "@/components/admin/WebsiteTabs";

export const metadata: Metadata = { title: "All other text" };

export default async function AllTextPage() {
  await requireAdmin();
  await discardDraft("text");
  const overrides = await getTextOverrides();
  return (
    <>
      <PageHeader
        title="Website text & photos"
        lead="Every other sentence on the website: the menu, booking page, client emails, contact form, blog labels, privacy policy and Google descriptions."
      />
      <WebsiteTabs active="text" />
      <TextEditor initial={overrides} />
    </>
  );
}
