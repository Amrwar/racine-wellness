import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getPricing } from "@/lib/pricing";
import { PageHeader } from "@/components/admin/ui";
import { PricingEditor } from "@/components/admin/PricingEditor";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  await requireAdmin();
  const pricing = await getPricing();
  return (
    <>
      <PageHeader
        title="Pricing"
        lead={
          <>
            Rates and promotion shown in the{" "}
            <a href="/#pricing" target="_blank" rel="noopener" className="font-medium text-blue-dark hover:underline">
              Pricing section
            </a>{" "}
            of the website, in English and French.
          </>
        }
      />
      <PricingEditor initial={pricing} />
    </>
  );
}
