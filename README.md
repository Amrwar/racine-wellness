# Racine Wellness

Marketing website for a Montréal personal trainer and naturopath. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and TypeScript. Deploys to Vercel with zero configuration.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, philosophy, services, process, testimonials, latest videos, FAQ teaser, CTA |
| `/about` | Bio, credentials, values |
| `/services` | Personal training, naturopathy, nutrition coaching, online coaching |
| `/programs` | Packages, à la carte pricing, pricing FAQ |
| `/videos` | Filterable video library with featured player |
| `/videos/[slug]` | Individual video page with related videos and VideoObject schema |
| `/faq` | Full FAQ with FAQPage schema |
| `/contact` | Contact form (server action), studio details, hours, map |
| `/privacy` | Privacy policy (Law 25 / PIPEDA) |

Also generated: `sitemap.xml`, `robots.txt`, Open Graph image, LocalBusiness JSON-LD.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing content

- **Business details** (name, owner, address, phone, hours, socials): `src/lib/site.ts`
- **Services, programs, pricing, testimonials, FAQ**: `src/lib/content.ts`
- **Videos**: `content/videos.json` (see below)
- **Design tokens** (colours, fonts): `src/app/globals.css` under `@theme`

### Posting a new video

Add an entry to `content/videos.json` and push. The videos page, detail page, home page and sitemap update automatically.

```json
{
  "slug": "my-new-video",
  "title": "My New Video",
  "description": "One or two sentences shown on the card and detail page.",
  "category": "Workouts",
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

Set `"featured": true` on the video that should appear in the large player at the top of `/videos`. New categories appear automatically in the filter bar.

## Contact form email

The form works out of the box. Without an email provider, submissions are logged to the server console. To deliver them by email:

1. Create a free account at https://resend.com and generate an API key.
2. Copy `.env.example` to `.env.local` and fill in `RESEND_API_KEY` (and optionally `CONTACT_TO_EMAIL`).
3. In Vercel, add the same variables under Project → Settings → Environment Variables.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to https://vercel.com/new, import the repository and click Deploy. No settings need to change.
3. After the first deploy, update `url` in `src/lib/site.ts` to your production domain so sitemap and Open Graph links are correct.
