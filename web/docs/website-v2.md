# NEVERSTOP multilingual catalog and inquiry site

## Features

- `/vi`, `/en`, `/zh`: translated public pages, navigation, catalog, product details,
  availability, form validation and confirmation. Language buttons keep the current
  page and submitted query filters. Database names/descriptions fall back to the
  existing Vietnamese content if a translation is missing.
- `/[locale]/products`: database-backed catalog, part/OE/model-code/name search,
  front/rear filters, vehicle fitment selection and pagination.
- `/[locale]/products/[slug]`: active product details, real images when available,
  OE references, fitment, recorded specifications and inquiry link. Missing images,
  prices and product specifications are not invented.
- `/[locale]/contact`: both supplied phone/Zalo contacts, shop address and inquiry
  form. Product-linked requests retain product ID and quantity in the existing
  Inquiry and InquiryItem tables.
- No shopping cart, checkout or payment collection.

## Inquiry operation

POST /api/inquiries saves a NEW inquiry and returns its unique reference. The route
supports idempotent retry, validates and bounds input, checks same-origin requests,
limits traffic in-process and applies a persistent per-phone submission limit.
The endpoint does not expose a public inquiry listing or customer information.
No email, SMS or Zalo notification is sent automatically. The owner should check
NEW inquiries in the existing PostgreSQL database; customers can also use the
provided Zalo links for direct communication. An authenticated inquiry management
screen and notification integration are not included in this public-site scope.

Production hosting must overwrite forwarded headers and apply its own edge rate
limits. The in-process limiter is defense in depth, not distributed anti-abuse.

## Run and verify

Follow catalog-v1.md for the existing PostgreSQL and Prisma setup. Do not reset the
existing database. No schema migration or seed overwrite is needed for this update.

- npm run typecheck
- npm run lint
- npm run build
- With a running app and seeded development database: npm run test:catalog
- npm run test:website

Tests use only synthetic inquiry records and remove their own fixtures. Do not run
fixture-writing tests against production. CATALOG_TEST_URL can select another
local server port; the app and tests must use the same development DATABASE_URL.

## Deployment

Code completion and a Codespaces preview are not public production deployment.
Configure DATABASE_URL privately on the chosen host. Set SITE_URL to the final
HTTPS origin to enable canonical links and the production sitemap. Never commit
.env. Apply existing migrations using prisma migrate deploy, generate the client,
then build and start. Phone/Zalo/address values are public data supplied by the owner
and are maintained in src/lib/site-config.ts.

Remaining business content: the database currently contains the seeded products.
Add verified product images, descriptions, specifications and stock data through
the existing product database as they become available.
