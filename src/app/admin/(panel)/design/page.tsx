import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDesign } from "@/lib/design";
import { getContent } from "@/lib/content";
import { discardDraft } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { DesignEditor } from "@/components/admin/DesignEditor";
import { normalizeSections } from "@/lib/design-data";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  await requireAdmin();
  await discardDraft("design");
  const [design, content] = await Promise.all([getDesign(), getContent()]);
  const bg = content.backgrounds;
  return (
    <>
      <PageHeader title="Design" lead="Shape the look of your website. Changes show in the preview right away; visitors see them once you publish." />
      <DesignEditor
        initial={{ ...design, sections: normalizeSections(design, content.blocks.map((b) => b.id)) }}
        names={Object.fromEntries(content.blocks.map((b) => [b.id, b.title.en || "Your section"]))}
        backgrounds={{
          services: bg.services?.src,
          about: bg.about?.src,
          blog: bg.blog?.src,
          contact: bg.contact?.src,
        }}
      />
    </>
  );
}
