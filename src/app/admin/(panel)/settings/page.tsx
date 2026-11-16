import type { Metadata } from "next";
import { passwordChangedAt, requireAdmin } from "@/lib/auth";
import { getBusiness } from "@/lib/business";
import { PageHeader } from "@/components/admin/ui";
import { BusinessForm, PasswordForm } from "@/components/admin/SettingsForms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const [business, changedAt] = await Promise.all([getBusiness(), passwordChangedAt()]);
  return (
    <>
      <PageHeader title="Settings" lead="Your contact details on the website, and your admin password." />
      <div className="space-y-6">
        <BusinessForm initial={business} fallbackNotify={process.env.CONTACT_TO_EMAIL || business.email} />
        <PasswordForm changedAt={changedAt} />
      </div>
    </>
  );
}
