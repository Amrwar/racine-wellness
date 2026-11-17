import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { discardDraft } from "@/lib/settings";
import { getContent } from "@/lib/content";
import { getPricing } from "@/lib/pricing";
import { images } from "@/lib/site";
import { PageHeader } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { WebsiteTabs } from "@/components/admin/WebsiteTabs";

export const metadata: Metadata = { title: "Website" };

export default async function WebsitePage() {
  await requireAdmin();
  await discardDraft("content");
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Website text & photos"
        lead={
          <>
            Edit what the{" "}
            <a href="/" target="_blank" rel="noopener" className="font-medium text-blue-dark hover:underline">
              home page
            </a>{" "}
            says, in English and French. Use “Translate from English” to draft the French, then read it over.
          </>
        }
      />
      <WebsiteTabs active="home" />
      <ContentEditor
        bookingOptions={(await getPricing()).services.map((p) => ({ id: p.id, label: p.title.en }))}
        initial={content}
        defaults={{ hero: images.hero.square.src, portrait: images.portrait, backgrounds: { services: "", about: "", blog: "", contact: "" } }} />
    </>
  );
}
