# Congo Builders website

Next.js App Router frontend for the Congo Builders corporate and property website.

## Run locally

```sh
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/en`. The site also supports `/fr` and `/zh-CN`.
Set `STRAPI_API_URL` to the Strapi base URL. Published services, projects,
properties and testimonials are fetched server-side. If the service or project
collections are unavailable, the site uses the documented static service list and
illustrative project references; property inventory is never fabricated.

## Contact email and property inquiries

The public contact form sends two emails through Resend: the visitor receives a
confirmation and the admin receives the message (with reply-to set to the
visitor). Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a verified Resend
sender), and `CONTACT_ADMIN_EMAIL`.

Property requests are customer inquiries, not contact messages. Visitors must
register or sign in before submitting one. The Strapi `POST /api/me/inquiries`
handler attaches each inquiry to the authenticated user and starts it with a
`pending` status. `GET /api/me/inquiries` returns only that user's inquiries.
Enable the `inquiry.createMine` and `inquiry.findMine` actions for the
Authenticated role in Strapi's Users & Permissions settings. The inquiry
content type also needs its status field applied when deploying the updated
Strapi schema. The Next.js route sends the JWT and the custom endpoint's
`{ data: { message, property: documentId } }` body. The offer amount and
currency are retained in the message; the current Core create handler does not
persist them as structured `price` and `currency` fields.

`STRAPI_API_TOKEN` is optional and is intended only for server-side collection
requests that require authentication.

## Accounts

Visitors can register or sign in from the site navigation. Strapi issues the
session token, which the Next.js server stores in an HTTP-only cookie. Signed-in
users can review inquiries related to their own Strapi account at
`/en/account/inquiries` (or the equivalent localized path).
Inquiry history is read through the authenticated, owner-scoped
`/api/me/inquiries` endpoint; the customer relation is never accepted from the
browser.
Customers can edit or delete only their own pending requests from the account
page. These operations use Strapi 5's `PUT /api/inquiries/:documentId` with a
`{ data: { message } }` body and `DELETE /api/inquiries/:documentId` without a
body, authenticated with the customer's session JWT. The Next.js Server Action
checks that the inquiry belongs to the customer and is still pending. Strapi's
standard `inquiry.update` and `inquiry.delete` permissions are collection-wide,
however; enabling them for the Authenticated role allows any authenticated
customer to call Strapi directly and mutate other inquiries. Use owner-scoped
Core routes before production if that access must be prevented.
The browser posts credentials to the same-origin `/api/auth/login` route; the
Next.js server forwards them to `${STRAPI_API_URL}/api/auth/local`. Set
`STRAPI_API_URL` to the absolute Strapi base URL (for example,
`https://buildersapi.salemcapital.cd`). `NEXT_PUBLIC_SITE_URL` is the website's
public URL and must not be used as the Strapi API URL.

## Production

```sh
npm run build
npm run start
```

Configure `NEXT_PUBLIC_SITE_URL` with the canonical public website origin for
metadata and the sitemap.

## Docker Compose

From the repository root, create the Compose environment file from the template:

```sh
cp .env.example .env
```

Set the optional server-side API tokens in `.env`, then run:

```sh
docker compose up --build
```

The website is available on port `6005` and connects to the Strapi service over
the Compose network. `NEXT_PUBLIC_SITE_URL` is also passed at image build time
because it is embedded in generated metadata and sitemap output.
