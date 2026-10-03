# HealthyZone

Bilingual (English / French) marketing website for HealthyZone, a Montréal registered massage therapist, certified trainer and naturopath. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and TypeScript. Deploys to Vercel with zero configuration.

## Pages

| English | French | Purpose |
| --- | --- | --- |
| `/` | `/fr` | Home: hero, philosophy, services, process, testimonials, latest videos, FAQ teaser, CTA |
| `/about` | `/fr/about` | Bio, credentials, values |
| `/services` | `/fr/services` | Massage therapy, personal training, naturopathy, nutrition coaching, online coaching |
| `/programs` | `/fr/programs` | Packages, à la carte pricing, pricing FAQ |
| `/videos` | `/fr/videos` | Filterable video library with featured player |
| `/videos/[slug]` | `/fr/videos/[slug]` | Individual video page with related videos and VideoObject schema |
| `/faq` | `/fr/faq` | Full FAQ with FAQPage schema |
| `/contact` | `/fr/contact` | Contact form (server action), details, hours, map |
| `/privacy` | `/fr/privacy` | Privacy policy (Law 25 / PIPEDA) |

Also generated: `sitemap.xml` (with hreflang alternates), `robots.txt`, Open Graph image, LocalBusiness JSON-LD.

## Languages

- English is served at the bare URL, French under `/fr`. To make French the default instead, change `defaultLocale` in `src/i18n/config.ts`.
- `/en/...` redirects to the bare URL so there is one canonical English address.
- The header has an EN / FR switcher that keeps you on the same page.
- All text lives in two dictionaries: `src/i18n/en.ts` and `src/i18n/fr.ts`. The French file is type-checked against the English one, so a missing translation fails the build.
- Headings can use `*asterisks*` to mark words rendered in the italic accent style.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (English) or http://localhost:3000/fr (French).

## Editing content

- **Business details** (name, owner, address, phone, email, socials, photos): `src/lib/site.ts`
- **All copy, services, programs, pricing, testimonials, FAQ**: `src/i18n/en.ts` and `src/i18n/fr.ts`
- **Videos**: `content/videos.json` (see below)
- **Photos**: `public/images/` (sourced from the HealthyZone Instagram account)
- **Design tokens** (colours, fonts): `src/app/globals.css` under `@theme`

### Posting a new video

Add an entry to `content/videos.json` and push. Both language versions of the videos page, the detail pages, the home page and the sitemap update automatically.

```json
{
  "slug": "my-new-video",
  "title": { "en": "My New Video", "fr": "Ma nouvelle vidéo" },
  "description": {
    "en": "One or two sentences shown on the card and detail page.",
    "fr": "Une ou deux phrases affichées sur la carte et la page de détail."
  },
  "category": { "en": "Workouts", "fr": "Séances" },
  "duration": "12:30",
  "date": "2026-10-15",
  "source": { "type": "youtube", "id": "YOUTUBE_VIDEO_ID" },
  "featured": true
}
```

Supported sources:

- `{ "type": "youtube", "id": "..." }`
- `{ "type": "vimeo", "id": "..." }`
- `{ "type": "file", "url": "https://.../video.mp4", "poster": "https://.../poster.jpg" }` (for example a file uploaded to Vercel Blob)

Set `"featured": true` on the video that should appear in the large player at the top of the videos page. New categories appear automatically in the filter bar. A plain string is accepted for any text field if you only want one language.

## Contact form email

The form works out of the box. Without an email provider, submissions are logged to the server console. To deliver them by email:

1. Create a free account at https://resend.com and generate an API key.
2. Copy `.env.example` to `.env.local` and fill in `RESEND_API_KEY` (and optionally `CONTACT_TO_EMAIL`).
3. In Vercel, add the same variables under Project → Settings → Environment Variables.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to https://vercel.com/new, import the repository and click Deploy. No settings need to change.
3. After the first deploy, update `url` in `src/lib/site.ts` to your production domain so sitemap and Open Graph links are correct.

## Before launch

- Replace the placeholder studio address, phone number and hours in `src/lib/site.ts` and both dictionaries.
- Replace the placeholder testimonials in both dictionaries with real client quotes (with permission).
- Confirm prices in the `programs` and `extras` sections of both dictionaries.
- Replace the sample videos in `content/videos.json` with HealthyZone's own.
