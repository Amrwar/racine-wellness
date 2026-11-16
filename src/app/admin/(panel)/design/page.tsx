import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDesign } from "@/lib/design";
import { getContent } from "@/lib/content";
import { images } from "@/lib/site";
import { PageHeader } from "@/components/admin/ui";
import { DesignEditor } from "@/components/admin/DesignEditor";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  await requireAdmin();
  const [design, content] = await Promise.all([getDesign(), getContent()]);
  const bg = content.backgrounds;
  return (
    <>
      <PageHeader title="Design" lead="Colours, text size, the order of the home-page sections, and how each one looks." />
      <DesignEditor
        initial={design}
        backgrounds={{
          services: bg.services?.src ?? images.sections.services,
          about: bg.about?.src ?? images.sections.about,
          blog: bg.blog?.src ?? images.sections.blog,
          contact: bg.contact?.src ?? images.sections.contact,
        }}
      />
    </>
  );
}
