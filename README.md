# CONGO BUILDERS — Corporate Website & Real Estate Platform

> **Implementation specification and development guide**

A multilingual, Strapi-powered corporate website and real estate platform for Congo Builders, built with Next.js, TypeScript and Tailwind CSS. Advertise it as the first digital real estate company in Lubumbashi and DRC in beautifull sections and with appealing shapes. 

---

## 1. Project Overview

Congo Builders is a Congolese construction, civil engineering and real estate company based in Lubumbashi, Democratic Republic of Congo.

The website will present the company's identity, services, completed projects and capabilities while providing a dynamic property catalogue for clients interested in renting or purchasing properties.

The platform must be fully manageable through a Strapi administration dashboard. Company personnel must be able to publish and update services, projects, property listings, articles and other website content without modifying frontend code.

### Main objectives

- Establish a strong, credible and professional digital presence.
- Present the company's construction and engineering expertise.
- Showcase completed and ongoing projects.
- Dynamically manage services and project portfolios.
- Offer properties for rent and sale.
- Generate enquiries from prospective clients and property buyers.
- Support English, French and Simplified Chinese.
- Provide an intuitive experience on desktop, tablet and mobile.
- Make the website search-engine friendly.
- Give the company full control over its content through Strapi.

---

## 2. Technology Stack

### Frontend

| Technology | Responsibility |
|---|---|
| Next.js (App Router) | Website framework and routing |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling and responsive layouts |
| next-intl | Multilingual routing and interface translations |
| Lucide React | Interface icons |
| Framer Motion | Carefully controlled animations |
| React Hook Form | Form management |
| Zod | Validation |
| Server Components | Server-side content rendering |

### Backend

| Technology | Responsibility |
|---|---|
| Strapi 5 | Headless CMS and content API |
| PostgreSQL | Database |
| Strapi REST API | Frontend/backend communication |
| Strapi i18n | Content localization |
| Strapi Draft & Publish | Content publishing workflow |
| Strapi Media Library | Image and document management |

### Infrastructure

- Node.js LTS compatible with the selected framework versions.
- PostgreSQL.
- Nginx reverse proxy.
- HTTPS using Let's Encrypt or equivalent.
- Persistent media storage.
- Environment-based configuration.
- Automated backups.

Use compatible stable releases of all dependencies. Keep dependency versions committed in the package lockfiles.

---

## 3. System Architecture

The application consists of two independent applications.

```text
                 WEBSITE VISITORS
                        |
                        v
             NEXT.JS FRONTEND
             Corporate Website
              English / French
                Chinese
                        |
                        |
                 Strapi REST API
                        |
                        v
                 STRAPI CMS
                 Admin Panel
                        |
             +----------+----------+
             |          |          |
             v          v          v
          Services   Projects   Properties
             |          |          |
             +----------+----------+
                        |
                        v
                   PostgreSQL
                        |
                        v
                  Media Storage
```

### Frontend responsibilities

- Render all public website pages.
- Display services and projects retrieved from Strapi.
- Display property listings and detailed property information.
- Provide search, filters and pagination.
- Handle contact and property enquiry forms.
- Render localized content.
- Manage metadata and SEO.
- Apply frontend caching and cache revalidation.

### Backend responsibilities

- Manage all website content.
- Manage services, projects and property listings.
- Manage translations.
- Manage images and documents.
- Receive and store enquiries.
- Manage publication status.
- Control API access and permissions.
- Provide content to the frontend.

**Important:** No business content should be permanently hardcoded into frontend components. Content must come from Strapi, except for interface labels, navigation conventions and technical fallback values.

---

# 4. Design System

## 4.1 Visual identity

The website must communicate:

- Professionalism.
- Engineering expertise.
- Reliability.
- Precision.
- Architectural sophistication.
- Stability.
- Quality workmanship.

The design must look like a premium construction and engineering company website, not a generic corporate template.

### Brand colors

| Token | Hexadecimal | Usage |
|---|---|---|
| Primary | `#013F6A` | Main brand color, navigation, headings, primary sections |
| Secondary | `#B29700` | Highlights, accents, selected states, decorative elements |
| White | `#FFFFFF` | Main background and contrast |
| Light background | `#F3F5F6` | Alternating sections and content backgrounds |
| Dark background | `#101D27` | Footer and selected dark sections |
| Body text | `#34414B` | Paragraphs and descriptions |
| Muted text | `#687680` | Supporting information |
| Border | `#D9E0E4` | Dividers and input borders |
| Success | `#237A4B` | Available or successful states |
| Warning | `#B27A00` | Reserved or pending states |
| Error | `#B42318` | Errors and unavailable states |

### Color usage

Primary blue should dominate the visual identity.

Gold must be used strategically to create contrast and emphasis. It must not overwhelm the interface.

Suggested distribution:

- 65% white and light neutral backgrounds.
- 25% primary blue.
- 10% gold accents.

These are visual guidelines, not rigid layout requirements.

## 4.2 Strict geometric design language

**No rounded corners anywhere.**

All interface elements must have sharp, precise edges.

The following are prohibited:

- `rounded-sm`
- `rounded-md`
- `rounded-lg`
- `rounded-xl`
- `rounded-full`
- Rounded buttons.
- Rounded cards.
- Rounded image containers.
- Pill-shaped navigation elements.
- Excessive circular decorations.

Set the global design radius to zero.

```css
:root {
  --color-primary: #013f6a;
  --color-secondary: #b29700;

  --color-white: #ffffff;
  --color-background: #f3f5f6;
  --color-dark: #101d27;

  --color-text: #34414b;
  --color-muted: #687680;
  --color-border: #d9e0e4;

  --radius-none: 0px;
}

* {
  border-radius: 0 !important;
}
```

Do not use the global rule as a substitute for design discipline: avoid introducing rounded components in the first place.

## 4.3 Beautiful architectural shapes

The design should use sophisticated geometric shapes inspired by architecture, engineering drawings and construction.

Use:

- Large rectangular image compositions.
- Diagonal cuts and angular image masks.
- Asymmetric grid layouts.
- Architectural line patterns.
- Thin gold dividers.
- Geometric section separators.
- Large typography.
- Layered rectangular surfaces.
- Structured image collages.
- Diagonal decorative elements.
- Carefully composed overlapping blocks.
- Numbered sections and technical labels.

Examples of suitable decorative treatments:

```css
/* Angled architectural image */
.architectural-image {
  clip-path: polygon(
    0 0,
    100% 0,
    100% 86%,
    92% 100%,
    0 100%
  );
}

/* Diagonal section accent */
.diagonal-accent {
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    12% 100%
  );
}

/* Angular decorative background */
.geometric-panel {
  background:
    linear-gradient(
      135deg,
      transparent 49.5%,
      rgba(178, 151, 0, 0.15) 50%,
      transparent 50.5%
    );
}
```

Use these shapes selectively. The layout must remain elegant, readable and functional.

Avoid decorative shapes that interfere with content, buttons or navigation.

## 4.4 Typography

Use a professional sans-serif typography system.

Recommended:

- Headings: `Manrope` or `Plus Jakarta Sans`.
- Body: `Inter`.
- Chinese fallback: `Noto Sans SC`.

Typography must establish a clear visual hierarchy.

Suggested scale:

| Element | Desktop size |
|---|---:|
| Hero heading | 64–84px |
| Main section heading | 40–52px |
| Page heading | 48–64px |
| Subheading | 24–30px |
| Card heading | 20–24px |
| Body text | 16–18px |
| Supporting text | 13–14px |

Use responsive typography with `clamp()`.

Headings should be confident and spacious. Body text should remain comfortable to read.

Avoid excessive uppercase text and overly condensed typography.

## 4.5 Buttons and interactive components

Buttons must be rectangular, sharp and immediately recognizable.

Primary button:

- Blue background.
- White text.
- Strong typography.
- Sharp edges.
- Gold hover or focus accent.

Secondary button:

- Transparent or white background.
- Blue border.
- Blue text.

Gold accent button:

- Gold background.
- Dark blue text.

All interactive components must provide:

- Visible hover states.
- Visible keyboard focus.
- Active states.
- Disabled states.
- Appropriate loading feedback.

Avoid unnecessary shadows, excessive gradients and visual clutter.

## 4.6 Layout and spacing

Use a consistent spacing scale based on multiples of four.

Recommended:

- Section spacing: 80–120px desktop.
- Section spacing: 48–72px mobile.
- Main content max width: 1440px.
- Desktop horizontal padding: 48–72px.
- Tablet horizontal padding: 28–36px.
- Mobile horizontal padding: 20–24px.
- Grid gap: 24–32px.

The website must have breathing room.

Do not squeeze too much information into one section.

## 4.7 Image direction

Images are critical to the brand experience.

Use high-quality, realistic photography showing:

- Modern buildings.
- Residential architecture.
- Commercial properties.
- Construction sites.
- Civil engineering projects.
- Engineers and construction professionals.
- Interior finishing.
- Roads and infrastructure.
- Real estate interiors and exteriors.

Prioritize genuine company project photographs whenever available.

Do not use cartoon illustrations, generic technology illustrations or low-quality stock imagery.

All images must:

- Have meaningful alternative text.
- Use optimized formats where possible.
- Be responsive.
- Have appropriate dimensions.
- Use Next.js image optimization.
- Have appropriate focal points and cropping.

---

# 5. User Experience and Navigation

The user experience must be straightforward, intuitive and professional.

Visitors should immediately understand:

1. What Congo Builders does.
2. What services the company offers.
3. What projects the company has completed.
4. Which properties are available for rent or purchase.
5. How to contact the company.

Avoid unnecessary navigation layers and complicated interaction patterns.

## 5.1 Main navigation

Recommended navigation:

- Home
- About Us
- Services
- Projects
- Real Estate
- Contact

The real estate navigation item should provide clear access to:

- Properties for Rent.
- Properties for Sale.
- All Properties.

Include a visible contact action in the desktop navigation.

On mobile, use a clean and accessible navigation drawer with clear hierarchy.

## 5.2 Homepage structure

The homepage should contain:

1. Header and main navigation.
2. Hero section.
3. Company introduction.
4. Core services.
5. Featured projects.
6. Real estate highlights.
7. Why choose Congo Builders.
8. Construction and engineering capabilities.
9. Client testimonials.
10. Call-to-action section.
11. Contact information.
12. Footer.

Every content-driven section must retrieve its information from Strapi.

The homepage must not become a long collection of unrelated cards. Build a strong narrative with varied layouts and clear visual hierarchy.

## 5.3 Intuitive navigation principles

- Use descriptive navigation labels.
- Make primary actions obvious.
- Provide breadcrumbs on inner pages.
- Keep filters understandable.
- Show active navigation states.
- Provide clear empty states.
- Make enquiry forms short and easy to complete.
- Never hide important actions behind decorative interactions.
- Preserve predictable back navigation.
- Make all important functionality accessible using a keyboard.

---

# 6. Multilingual Architecture

The website supports three languages:

| Language | Locale |
|---|---|
| English | `en` |
| French | `fr` |
| Simplified Chinese | `zh-CN` |

Use:

- Strapi i18n plugin for localized CMS content.
- `next-intl` for frontend localization.
- Locale-prefixed routes.
- Localized SEO metadata.
- Localized slugs where appropriate.

### URL structure

```text
/en
/en/about
/en/services
/en/projects
/en/properties
/en/contact

/fr
/fr/a-propos
/fr/services
/fr/projets
/fr/immobilier
/fr/contact

/zh-CN
/zh-CN/about
/zh-CN/services
/zh-CN/projects
/zh-CN/properties
/zh-CN/contact
```

The final translated slugs must be managed consistently.

### Translation requirements

All public content must support localization where appropriate:

- Titles.
- Descriptions.
- Service content.
- Project content.
- Property descriptions.
- Articles.
- Testimonials.
- SEO metadata.
- Navigation labels.
- Form labels and validation messages.

Do not automatically translate company names, addresses, legal names or technical terminology without validation.

If a translation is unavailable, use a controlled fallback strategy and do not expose untranslated CMS field structures to visitors.

The language switcher should preserve the current page when a translation exists. If it does not, navigate to the corresponding localized page or the localized homepage.

---

# 7. Strapi Content Management System

The live strapi is hosted not local, there's a demo instance in the cloud. Also use static content for entities that are not integrated in the remote strapi instance. Use the folowing content to populate mock content at leat 3 entries for every collection type :

## Admin and Users-permissions User's credentials

- Endpoint : https://buildersapi.salemcapital.cd
- User : celiitellu@gmail.com
- Pass : Max@1968

You can use use these credentials to either connect to the admin portal or to get a session token with a simple user in order to poulate services(as listed here), pojects(you create mock projects based on the company expertise fields), testimonials, team members, properties and properties inquiries. For images, download them on pexels the post them on the live demo instance. Strictly follow the api/content-types specs when populating mock data.

## Important note

Make sure you respect the strapi version used here for api endpoints structure.

# 8. Dynamic Services Module

Services must be fully managed through Strapi.

Company administrators should be able to create, update, reorder, publish and unpublish services.

## 8.2 Services based on company profile

The initial content should include (Create them on the remote instance if they dont exist):

1. New Construction.
2. Civil Engineering.
3. Renovation and Finishing.
4. Construction Studies and Site Supervision.
5. Electricity.
6. Real Estate.

The service descriptions must be based on the company profile.

### New Construction

- Villas.
- Apartment buildings.
- Commercial buildings.
- Industrial buildings.

### Civil Engineering

- Roads.
- Drainage channels.
- Paving and slabs.
- Retaining walls.
- Sanitation.

### Renovation and Finishing

- Tiling.
- Painting.
- Ceilings.
- Roofing.
- Carpentry.

### Construction Studies and Site Supervision

- Architectural plans.
- Quantity estimates.
- Complete project supervision.

### Electricity

- Domestic electrical installations.
- Motor installation and modelling, subject to confirmation of the exact service terminology.
- Solar energy.

### Real Estate

The company profile contains a repeated renovation description under Real Estate. Do not invent a replacement description. Obtain confirmation from Congo Builders before publishing the definitive real estate service description.

---

# 9. Dynamic Projects Module

Projects must be completely dynamic.

Administrators must be able to add new projects and update existing ones without developer intervention.

## 9.1 Project fields

Populated mock projects are used

### Project status

```text
PLANNED
ONGOING
COMPLETED
ON_HOLD
```

### Project category examples

- Residential.
- Commercial.
- Industrial.
- Civil Engineering.
- Infrastructure.
- Renovation.
- Electrical.

Project categories should be manageable through Strapi rather than permanently fixed in the frontend.

## 9.2 Project frontend

Create:

```text
/[locale]/projects
/[locale]/projects/[slug]
```

The project listing must support:

- Category filters.
- Project status filters.
- Pagination.
- Featured projects.
- Responsive image galleries.

The detail page should display:

- Project title.
- Cover image.
- Description.
- Project gallery.
- Location.
- Client, when available.
- Project status.
- Dates, when available.
- Related services.
- Related projects.

Never display empty or missing project metadata as placeholder text.

---

# 10. Real Estate Platform

Real estate must be treated as a first-class website module, not merely a section describing the company's real estate services.

Visitors must be able to explore properties for rent and purchase.

## 10.1 Public routes

```text
/[locale]/properties
/[locale]/properties/rent
/[locale]/properties/buy
/[locale]/properties/[slug]
```

## 10.2 Property content type

Mock content is used

### Transaction type

```text
RENT
SALE
```

### Property types

```text
HOUSE
APARTMENT
LAND
OFFICE
COMMERCIAL
INDUSTRIAL
OTHER
```

### Currency

```text
USD
CDF
```

### Property availability

```text
AVAILABLE
RESERVED
RENTED
SOLD
```

Only available properties should appear in normal public search results.

Reserved, rented and sold properties must not be presented as available.

An optional archive or availability filter can expose historical listings if the company chooses.

## 10.3 Property search

Implement a simple and intuitive search interface.

Filters:

- Transaction type.
- Location.
- Property type.
- Minimum price.
- Maximum price.
- Bedrooms.
- Bathrooms.
- Surface area.

Include:

- Search button.
- Reset filters action.
- Result count.
- Clear filter indicators.
- Pagination.
- Empty search results state.

The mobile filter experience should use an accessible panel or drawer.

Filters must be reflected in URL query parameters so users can share their searches.

## 10.4 Property listing cards

Every property card should display:

- Main photograph.
- Transaction type.
- Property type.
- Title.
- Location.
- Price and currency.
- Bedrooms and bathrooms where applicable.
- Surface area where available.
- Availability status.

Cards must use sharp rectangular geometry.

Do not use rounded property cards.

## 10.5 Property details

The property detail page should include:

- Image gallery.
- Property title.
- Price.
- Location.
- Transaction type.
- Property type.
- Availability.
- Description.
- Specifications.
- Amenities.
- Location map when coordinates are available.
- Enquiry form.
- Similar properties.

Do not fabricate property inventory, prices or addresses. The website should display only real published listings.

## 10.6 Property enquiries

Create `api::property-enquiry.property-enquiry`.

Fields:

| Field | Type |
|---|---|
| Property | Relation to Property |
| Full name | Text |
| Email | Email, optional |
| Phone | Text |
| Preferred contact method | Enumeration |
| Message | Text |
| Status | Enumeration |
| Submitted at | DateTime |

Preferred contact methods:

```text
PHONE
EMAIL
WHATSAPP
```

Enquiry statuses:

```text
NEW
CONTACTED
CLOSED
```

Enquiries must be validated and protected against spam and automated abuse.

---

# 11. Contact and General Enquiries

Create a dedicated contact page.

The page must display:

- Company address.
- Phone numbers.
- Email address.
- Business contact information.
- Map, if a verified location is available.
- Contact form.

### Initial company contact information

```text
Company: Congo Builders
Location: Lubumbashi, Haut-Katanga,
          Democratic Republic of Congo

Phone: +243 89-553-1458
Phone: +243 82-292-2372

Email: infos@congo-btp.com
Website: www.congo-btp.com
```

The company profile also mentions `Congobuilders-drc.com`. Confirm whether this is an additional domain before using it.

### Contact form fields

- Full name.
- Email.
- Phone.
- Subject.
- Message.

The form must:

- Validate inputs.
- Display clear error messages.
- Show loading feedback.
- Display successful submission confirmation.
- Prevent duplicate submissions where practical.
- Store submissions in Strapi.
- Notify the company by email through a configured email provider.

Never expose email provider credentials or private API tokens in browser-side code.

---

# 12. Additional Dynamic Content

## 12.1 Testimonials

Fields:

- Client name.
- Company.
- Position.
- Testimonial.
- Photo or logo.
- Display order.
- Featured.

## 12.2 Team members

Fields:

- Full name.
- Position.
- Biography.
- Photo.
- Social links.
- Display order.
- Published status.

## 12.3 Partners

Fields:

- Partner name.
- Logo.
- Website.
- Description.
- Display order.
- Featured.

## 12.4 Articles and news

Fields:

- Title.
- Slug.
- Excerpt.
- Content.
- Cover image.
- Category.
- Author.
- Publication date.
- SEO.
- Featured status.

Routes:

```text
/[locale]/news
/[locale]/news/[slug]
```

## 12.5 Homepage management

The homepage must be manageable through a Strapi single type.

Recommended fields:

- Hero title.
- Hero subtitle.
- Hero image.
- Hero primary action.
- Hero secondary action.
- Company introduction.
- Featured services.
- Featured projects.
- Featured properties.
- Company statistics.
- Testimonials.
- Closing call to action.

Use dynamic zones only when editorial flexibility is genuinely required. Keep the frontend section components predictable and controlled.

---

# 13. Frontend Application Structure

Recommended structure:

```text
congo-builders/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   │
│   │   │   │   ├── about/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── properties/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── rent/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── buy/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── news/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── contact/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── contact/
│   │   │   │   └── property-enquiries/
│   │   │   │
│   │   │   ├── globals.css
│   │   │   └── robots.ts
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── navigation/
│   │   │   ├── home/
│   │   │   ├── services/
│   │   │   ├── projects/
│   │   │   ├── properties/
│   │   │   ├── contact/
│   │   │   ├── forms/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   │
│   │   ├── lib/
│   │   │   ├── strapi/
│   │   │   │   ├── client.ts
│   │   │   │   ├── queries.ts
│   │   │   │   ├── services.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── properties.ts
│   │   │   │   └── types.ts
│   │   │   ├── validation/
│   │   │   └── utils/
│   │   │
│   │   ├── i18n/
│   │   ├── messages/
│   │   │   ├── en.json
│   │   │   ├── fr.json
│   │   │   └── zh-CN.json
│   │   │
│   │   └── types/
│   │
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── extensions/
│   │   └── index.ts
│   ├── types/
│   └── package.json
│
├── deployment/
│   ├── nginx/
│   └── docker/
│
├── docker-compose.yml
└── README.md
```

The exact generated Strapi files must follow the Strapi CLI conventions. Do not manually replace generated configuration files with incompatible structures.

---

# 15. Caching and Content Revalidation

The frontend should use Next.js server-side rendering and caching strategically.

Recommended tags:

```text
services
service:{slug}
projects
project:{slug}
properties
property:{slug}
homepage
articles
global
```

Use Next.js cache revalidation after successful content changes.

Configure a Strapi webhook to notify the Next.js application when published content changes.

The webhook must:

1. Authenticate using a shared secret.
2. Identify the changed content type.
3. Identify the affected locale and slug where possible.
4. Revalidate the appropriate cache tags or paths.
5. Return an appropriate HTTP response.

Never accept unauthenticated requests that trigger unrestricted cache invalidation.

Content updates must appear on the public website without requiring a complete redeployment.

---

# 16. Security

Security must be considered from the beginning.

### Strapi

- Use strong administrator credentials.
- Use separate API tokens for frontend access and integrations.
- Restrict token permissions to necessary operations.
- Allow public read access only to intended published content.
- Do not expose enquiry records through public read permissions.
- Validate all incoming submissions.
- Configure CORS for approved origins.
- Protect the admin panel.
- Keep secrets outside source control.
- Maintain regular database and media backups.

### Next.js

- Keep Strapi credentials server-side.
- Validate all form submissions with Zod.
- Sanitize rich content before rendering.
- Protect API routes.
- Add rate limiting to public forms.
- Use anti-spam measures.
- Never trust client-supplied prices, IDs or status values.
- Use secure HTTP headers.
- Do not expose private backend error details.

### Enquiries

Public users may submit enquiries, but must never be allowed to retrieve other users' submissions.

Enquiry creation should be handled through protected Next.js server endpoints or an appropriately secured Strapi custom endpoint.

---

# 17. SEO and Search Visibility

SEO is essential for a construction and real estate company.

Implement:

- Unique localized page titles.
- Unique localized descriptions.
- Canonical URLs.
- `hreflang` alternate links.
- XML sitemap.
- Robots configuration.
- Open Graph metadata.
- Twitter card metadata.
- Structured data where appropriate.
- Descriptive image alternative text.
- Clean URLs.
- Internal linking.
- Optimized page performance.

### Suggested target search topics

- Construction company in Lubumbashi.
- Construction services in Haut-Katanga.
- Civil engineering in DR Congo.
- Building contractor in Lubumbashi.
- House construction in Lubumbashi.
- Real estate in Lubumbashi.
- Houses for rent in Lubumbashi.
- Properties for sale in Lubumbashi.

These are SEO targets, not claims about ranking or search volume.

### Structured data

Where the content supports it, implement:

- Organization.
- LocalBusiness, if the business details qualify.
- Service.
- BreadcrumbList.
- Article.
- Product or appropriate real estate listing markup only when valid.

Never generate fabricated ratings, reviews, prices or availability in structured data.

---

# 18. Performance and Accessibility

The website must be fast and accessible.

### Performance

- Use Next.js Image.
- Prefer modern image formats.
- Use responsive image sizes.
- Lazy-load below-the-fold images.
- Optimize font loading.
- Avoid excessive client-side JavaScript.
- Use React Server Components by default.
- Minimize unnecessary animation.
- Avoid large blocking scripts.
- Implement pagination for large collections.
- Cache public content appropriately.

### Accessibility

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible form labels.
- Appropriate contrast.
- Meaningful alternative text.
- Accessible menus and dialogs.
- Proper heading hierarchy.
- Screen-reader-friendly validation.
- Reduced-motion support.

Target WCAG 2.2 AA where practical.

---

# 19. Development Setup

## 19.1 Prerequisites

Install:

- Node.js LTS compatible with the chosen Next.js and Strapi releases.
- npm.
- PostgreSQL.
- Git.

## 19.2 Create the frontend

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Install dependencies:

```bash
cd frontend

npm install next-intl lucide-react framer-motion
npm install react-hook-form zod @hookform/resolvers
```

## 19.3 Create the Strapi backend

From the repository root:

```bash
npx create-strapi@latest backend
```

Choose PostgreSQL during configuration.

Install and configure the Internationalization plugin according to the selected Strapi release.

Enable the locales:

```text
en
fr
zh-CN
```

## 19.4 Configure environment variables

Create the frontend and backend environment files using the templates above.

Generate unique secrets.

Do not use example passwords in production.

## 19.5 Configure Strapi content types

Create the collection types, single types and reusable components described in this document.

Enable localization for all content that must be translated.

Enable Draft & Publish for editorial content.

Configure the required relations.

## 19.6 Configure permissions

Create a public API role with only the permissions required to retrieve published public content.

Do not grant public users permission to list or retrieve enquiries.

Use private server-side tokens for protected operations.

## 19.7 Run the applications

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run develop
```

Default development addresses:

```text
Frontend: http://localhost:3000
Strapi:   http://localhost:1337
Admin:    http://localhost:1337/admin
```

---

# 20. Deployment Architecture

Recommended production domains:

```text
www.congo-btp.com
    -> Next.js frontend

cms.congo-btp.com
    -> Strapi backend
```

PostgreSQL should remain private and must not be exposed publicly.

### Production requirements

- HTTPS for both applications.
- Persistent PostgreSQL storage.
- Persistent Strapi media storage.
- Secure environment variables.
- Database backup schedule.
- Media backup schedule.
- Application logging.
- Monitoring.
- Reverse proxy configuration.
- Firewall restrictions.
- Health checks.
- Recovery procedure.

### Deployment checklist

```text
[ ] Configure production domains
[ ] Configure DNS
[ ] Configure HTTPS
[ ] Configure PostgreSQL
[ ] Configure persistent media storage
[ ] Configure Strapi environment variables
[ ] Build Strapi for production
[ ] Build Next.js for production
[ ] Configure Nginx
[ ] Configure CORS
[ ] Configure API tokens
[ ] Configure webhook
[ ] Test content publication
[ ] Test multilingual routes
[ ] Test contact submissions
[ ] Test property enquiries
[ ] Test image delivery
[ ] Test backups
```

---

# 21. Content Management Workflow

The website must be usable by non-technical company personnel.

Recommended publishing workflow:

1. Administrator signs into Strapi.
2. Administrator opens the relevant content module.
3. Administrator creates or edits content.
4. Administrator uploads photographs.
5. Administrator completes the available language versions.
6. Administrator saves a draft.
7. Administrator reviews the content.
8. Administrator publishes it.
9. Next.js receives the update through the webhook.
10. The published content becomes visible on the website.

This workflow must work for services, projects, properties and articles.

---

# 22. Required Pages and Functionality

| Page | Dynamic content | Required functionality |
|---|---|---|
| Homepage | Homepage, services, projects, properties | Featured content and CTAs |
| About | About page, team, statistics | Company presentation |
| Services | Service collection | Listing and filtering |
| Service details | Individual service | Related projects |
| Projects | Project collection | Category and status filters |
| Project details | Individual project | Gallery and related services |
| Properties | Property collection | Search and filters |
| Rent | Rental properties | Rental-specific filters |
| Buy | Sale properties | Sale-specific filters |
| Property details | Individual property | Gallery and enquiry |
| News | Article collection | Pagination |
| Article details | Individual article | Related content |
| Contact | Contact page and global settings | Contact form |

---

# 23. Implementation Phases

## Phase 1 — Project foundation

- Create repository.
- Set up Next.js.
- Set up Strapi.
- Configure PostgreSQL.
- Configure localization.
- Establish the design system.
- Configure API integration.

**Deliverable:** Working frontend and backend foundations.

## Phase 2 — Corporate website

- Header and footer.
- Homepage.
- About page.
- Dynamic services.
- Dynamic projects.
- Project details.
- Service details.

**Deliverable:** Complete corporate website connected to Strapi.

## Phase 3 — Real estate platform

- Property content type.
- Property catalogue.
- Rent and sale sections.
- Search and filtering.
- Property detail pages.
- Property enquiry forms.

**Deliverable:** Functional property discovery platform.

## Phase 4 — Additional content

- Testimonials.
- Team members.
- Partners.
- Articles and news.
- Homepage content management.
- Global settings.

**Deliverable:** Complete content management experience.

## Phase 5 — Quality and deployment

- SEO.
- Performance.
- Accessibility.
- Security review.
- Responsive testing.
- Production deployment.
- Backups and monitoring.

**Deliverable:** Production-ready website.

---

# 24. Acceptance Criteria

The project is complete only when all the following conditions are met.

### Design

- [ ] Brand colors are implemented consistently.
- [ ] All components have sharp corners.
- [ ] No rounded buttons or cards.
- [ ] Architectural geometric shapes are used tastefully.
- [ ] Layouts are visually balanced.
- [ ] Typography is consistent.
- [ ] Mobile design is polished.
- [ ] The website feels premium and professional.

### Content management

- [ ] Services are retrieved from Strapi.
- [ ] Projects are retrieved from Strapi.
- [ ] Properties are retrieved from Strapi.
- [ ] Administrators can create and update content.
- [ ] Administrators can upload galleries.
- [ ] Administrators can publish and unpublish content.
- [ ] Content updates are reflected without redeployment.

### Multilingual

- [ ] English works.
- [ ] French works.
- [ ] Simplified Chinese works.
- [ ] Content translations are managed in Strapi.
- [ ] Language switching works.
- [ ] SEO metadata is localized.

### Real estate

- [ ] Rent listings work.
- [ ] Sale listings work.
- [ ] Search works.
- [ ] Filters work.
- [ ] Property details work.
- [ ] Availability statuses are respected.
- [ ] Enquiries are stored securely.

### Technical

- [ ] Frontend builds successfully.
- [ ] Strapi builds successfully.
- [ ] PostgreSQL is persistent.
- [ ] API credentials are protected.
- [ ] Forms are validated.
- [ ] SEO is implemented.
- [ ] Images are optimized.
- [ ] Backups are configured.
- [ ] HTTPS is active.

---

# 25. Important Business Content Considerations

The company profile is the primary source for the initial company information.

The following information is available:

**Company:** Congo Builders  
**Location:** Lubumbashi, Haut-Katanga, Democratic Republic of Congo  
**Phone:** +243 89-553-1458  
**Phone:** +243 82-292-2372  
**Email:** infos@congo-btp.com  
**Website:** www.congo-btp.com

The profile describes the company's commitment to quality, deadlines, careful finishing, qualified technical personnel, controlled materials and project delivery.

For now invent and get images from pexels:

- Completed project references.
- Client names.
- Testimonials.
- Team members.
- Certifications.
- Property inventory.
- Property prices.
- Company statistics.
- Additional office addresses.

These must be entered when verified information becomes available.

The real estate service description must also be confirmed because the supplied profile repeats the renovation description in that section.

---
