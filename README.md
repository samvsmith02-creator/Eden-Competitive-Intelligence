# EDEN Competitive Intelligence

A responsive, founder-led advisory website built with Next.js App Router, React, TypeScript, and Tailwind CSS. The visual system uses navy, ivory, steel blue, self-hosted Libre Caslon Display and DM Sans, and an original architectural illustration. No stock clients, testimonials, contact details, or research results are included.

## Develop and preview

Use Node.js 22.13+ (Node 24 is validated) and npm. No database is required.

```sh
cd /workspace/Eden-Competitive-Intelligence
npm ci --cache /workspace/.cache/npm
npm run dev
```

The development server listens on port 3000. On your own machine, open `http://localhost:3000`. In a cloud task, use the platform's supported preview facility if available. The npm cache flag is useful in this cloud machine because the default home cache is not writable; elsewhere plain `npm ci` works.

For a production preview:

```sh
npm run build
npm run start
```

Do not run the development and production servers on the same port simultaneously. This task uses the existing isolated checkout; no additional Git worktree is needed.

## Pages and structure

```text
src/app/                 App Router pages, metadata, error and not-found states
  api/contact/route.ts   Server-only inquiry endpoint (Node runtime)
  insights/[slug]/       Reusable, statically generated draft article template
src/components/          Shared navigation, wordmark, footer, CTA, and contact form
src/lib/content.ts       Services, industries, principles, and editorial drafts
src/lib/inquiries.ts     Validation, abuse controls, and server-side email workflow
public/                  Original architectural SVG source and optimized WebP
tests/                   Inquiry-handler tests and desktop/mobile browser tests
```

Home, About, Services, Industries, Insights, and Contact each have their own route and metadata. The additional privacy page explains the form implementation. Five original sample perspectives are visibly labeled **unpublished editorial drafts**, carry `noindex`, and are excluded from the sitemap. No dates, citations, or external findings are invented.

## Configure the contact form

Copy `.env.example` to `.env.local` for local development, or enter variables securely in your deployment/environment settings. Do not commit `.env.local` or put credentials in client code.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Server-only Resend credential authorized to send email |
| `CONTACT_FROM_EMAIL` | A plain email address on a verified Resend sending domain |
| `CONTACT_TO_EMAIL` | The real business inbox that should receive inquiries |
| `NEXT_PUBLIC_SITE_URL` | The real HTTPS site origin, without a trailing slash; enables absolute metadata and sitemap URLs |

The first three values are required for delivery. No example business addresses are presented as actual contact details. While delivery is unconfigured, the Contact page shows an availability notice and disables submission; direct API calls return `503`. Settings are read at runtime for the dynamic Contact page. `NEXT_PUBLIC_SITE_URL` should be set before building.

When configured, `POST /api/contact` validates fields, checks the request origin, checks a honeypot and minimum completion time, applies a five-attempt/15-minute limit, and sends a **plain-text** email through `https://api.resend.com/emails`. The visitor's address is used as `reply_to`, not as the sender. Confirmation is returned only after the provider accepts the email and returns a receipt. Provider acceptance does not guarantee inbox delivery. Errors preserve the visitor's entered form values and never present a fake success.

The application does not store inquiries in a database or log message bodies. Inquiries are handled by the configured email provider and business inbox. Do not send confidential information through the form.

**Production abuse protection:** the built-in rate limiter is per process and resets on restart. It is a useful local safeguard, not a durable or distributed limit. For a public serverless deployment, configure a Vercel Firewall rate-limit rule for `/api/contact` (or use an equivalent shared rate-limit service) before accepting live inquiries. Hosts other than Vercel must strip untrusted `X-Forwarded-For` headers and supply the real client address. Honeypots and timing checks do not stop all automated abuse. No CAPTCHA or third-party tracker is loaded.

The website does not send automatic customer replies or promise a response time. Actual sender-domain verification, provider access, and inbox receipt need a live test after credentials are supplied.

## Validate

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The inquiry tests use a mocked email transport; they never send live email. They cover successful provider acceptance, malformed requests, field validation, missing configuration, cross-origin submissions, honeypot/timing/consent checks, rate-limit expiry, oversized bodies, and delivery failures.

Playwright checks the production server on desktop and mobile, including axe accessibility checks against WCAG A/AA rules on the primary pages and an article. Automated checks complement, but do not replace, manual accessibility review. It starts `npm run start` if port 3000 is free. The unconfigured-form test deliberately expects missing delivery credentials; run it with the three delivery variables unset. On this cloud machine, system Chromium is available:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

On another machine, install Playwright's browser once using `npx playwright install chromium`. You can run browser checks against an already running development server, although the production build is the release check. For a first `typecheck` before any Next build/dev run, use `npx next typegen` to create route types if needed.

## Deploy to Vercel

1. Commit the project and push it to the intended GitHub branch. The repository was empty when this project was created; no push or deployment is performed by the local build.
2. Import the repository into Vercel. Choose **Next.js**, Node.js **24.x**, the repository root, build command `npm run build`, and the default output settings. Let Vercel install from `package-lock.json`.
3. Add the four variables above in Vercel's project settings for the appropriate environments. Verify your sending domain in Resend and use a real, authorized recipient. Preview deployments may leave delivery disabled to prevent accidental inquiries.
4. Review the founder biography and credentials, the draft insights, the privacy wording, your data retention practices, and your real business contact details. Add a confirmed privacy contact and retention policy before enabling the public form.
5. Configure durable abuse protection, deploy, and submit one genuine test inquiry. Confirm provider acceptance and actual receipt in your inbox. Check mobile navigation, all CTAs, metadata, and error behavior on the deployed origin.

### Connect a custom domain

In Vercel, open **Project → Settings → Domains**, add your actual domain, and follow the DNS records Vercel displays at your registrar. Use the exact generated records rather than copied example IPs. Choose a canonical domain, redirect the alternate `www`/apex hostname to it, and wait for DNS verification and HTTPS provisioning. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and redeploy so metadata, robots, and sitemap reference the right host. Resend sending-domain DNS verification is a separate setup from website hosting.

## Content and launch items

- Replace the explicitly labeled Sam Smith portrait placeholder with an authorized professional portrait using `next/image`, appropriate alt text, and explicit dimensions.
- Verify the supplied founder education and athletic biography before publication.
- Review and publish insights deliberately: remove the draft notices and `noindex` only after approval, then add approved articles to the sitemap. Keep sources and dates accurate if added.
- Add only confirmed business contact details; none are invented in this implementation.
- Configure the real domain, verified email sender, recipient, and secure API credential. Review privacy/retention details and production abuse limits.

Fonts and artwork are served locally. There are no external font requests, analytics integrations, or browser-visible API secrets.
