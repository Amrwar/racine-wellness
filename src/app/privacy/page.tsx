import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal information.`,
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" lead="Last updated October 2026." />
      <section className="py-20 sm:py-28">
        <Container>
          <div className="prose-site max-w-3xl">
            <p>
              {site.name} (“we”, “us”) respects your privacy and complies with Québec’s Act respecting
              the protection of personal information in the private sector (Law 25) and Canada’s
              PIPEDA. This policy explains what we collect, why, and your rights.
            </p>
            <h2>What we collect</h2>
            <ul>
              <li>Contact details you submit through our forms (name, email, phone).</li>
              <li>Information you share about your goals, health and lifestyle during consultations.</li>
              <li>Basic, anonymous usage analytics to improve the website.</li>
            </ul>
            <h2>How we use it</h2>
            <p>
              To respond to your enquiry, deliver coaching and naturopathic services, issue receipts,
              and send you information you have requested. We never sell your data and never share
              health information without your explicit consent, except as required by law.
            </p>
            <h2>Storage and security</h2>
            <p>
              Client records are stored in encrypted, access-controlled systems. Website form
              submissions are transmitted over HTTPS and delivered to our business email.
            </p>
            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information at
              any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>. Our privacy
              officer is {site.owner}.
            </p>
            <h2>Cookies</h2>
            <p>
              This site uses only strictly necessary cookies and privacy-friendly analytics. Embedded
              videos are loaded in privacy-enhanced mode and only after you click play.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
