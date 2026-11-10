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

## Enquiry delivery

Contact and property enquiry forms validate submissions on the server and forward
them to Strapi. Set `STRAPI_INQUIRY_API_TOKEN` to a restricted server-side token
with only the `inquiry.create` and `inquiry.find` permissions. The token is used
only by server routes and is never exposed to the browser. `STRAPI_API_TOKEN` is
optional and is intended only for other server-side collection requests that
require authentication.

## Accounts

Visitors can register or sign in from the site navigation. Strapi issues the
session token, which the Next.js server stores in an HTTP-only cookie. Signed-in
users can review inquiries related to their own Strapi account at
`/en/account/inquiries` (or the equivalent localized path).
Inquiry history is read through the authenticated `/api/users/me` relation rather
than by exposing the inquiries collection to the browser.
On the current remote instance, the Authenticated role must also have
`inquiry.find` enabled for that relation to resolve. This permits authenticated
users to query the inquiries collection directly, so it is not a
privacy-hardened production configuration; use a server-side owner-scoped
endpoint before production.

The current remote Strapi API rejects writes to the `customer` relation on
`/api/inquiries` (`Invalid key customer`). Authenticated inquiry submissions
therefore return an explicit error instead of being saved as unowned records.
Enabling account-linked submissions requires a server-side Strapi endpoint that
sets `customer` from the authenticated user; the `core/` content-type files are
intentionally left unchanged.

## Production

```sh
npm run build
npm run start
```

Configure `NEXT_PUBLIC_SITE_URL` with the canonical public website origin for
metadata and the sitemap.
