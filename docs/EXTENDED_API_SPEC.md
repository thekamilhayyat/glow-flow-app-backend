# Glowflow Extended API Spec (Public Booking, Payments, Portal, Upsells, Groups, Waitlist, Notifications, Reporting)

This document extends `app-glowdesk-FE/API_DOCUMENTATION.md` with competitive features for frontend integration.

Base URL: `/api/v1`

## 1) Public/Embedded Booking

- GET `/public/business/:businessId/services` → list public services (with categories, add-ons, upsell suggestions)
- GET `/public/business/:businessId/availability?serviceIds=uuid,uuid&startDate=ISO&endDate=ISO` → combined availability for selected services (sequential)
- POST `/public/business/:businessId/book`
  - Body: `{ client: {name, email, phone}, services: [{serviceId, addOnIds?, staffId?}], startTime, preferences?, marketingOptIn?, policyAccepted: boolean, deposit?: { amount, currency } }`
  - If deposit/card required: returns `{ requiresAction: true, clientSecret }` for Stripe; otherwise returns `{ appointment }`

Widget embedding: Businesses load booking page `/booking/:businessId` in an overlay or iframe.

## 2) Payments, Deposits, Policies

- POST `/payments/create-intent`
  - Body: `{ amount, currency, captureMethod?: 'automatic'|'manual', purpose: 'deposit'|'prepay', appointmentDraftId }`
  - Response: `{ clientSecret, paymentIntentId }`
- POST `/payments/create-setup-intent`
  - Body: `{ clientId?, email, phone }`
  - Response: `{ clientSecret, setupIntentId }` (card-on-file)
- POST `/bookings/confirm`
  - Body: `{ appointmentDraftId, paymentIntentId? | setupIntentId?, policyAccepted: true }`
  - Response: `{ appointment }`

Business Settings:
- GET `/settings/policies` → `{ cancellation: { cutoffHours, feeType: 'fixed'|'percentage', feeValue } }`

## 3) Service Add-ons & Upsells

- Services include `addOns: [{id, name, duration, price}]` and `upsells: [{serviceId, discountType?, discountValue?}]`
- GET `/services?public=true&category=...` supports category filters

## 4) Multi-Service & Group Bookings

- POST `/availability/sequence`
  - Body: `{ items: [{serviceId, staffId?}], startDate, endDate }`
  - Response: `{ suggestions: [{ startTime, slots: [{serviceId, staffId, startTime, endTime}] }] }`
- Group booking draft:
  - POST `/bookings/draft` → `{ draftId }`
  - POST `/bookings/draft/:draftId/guests` add guest: `{ guest: {name,email,phone}, items: [...] }`
  - GET `/bookings/draft/:draftId/availability` consolidated availability
  - POST `/bookings/draft/:draftId/confirm` finalize

## 5) Waitlist

- POST `/waitlist` → `{ businessId, serviceId?, staffId?, preferredTimes?: string, client: {name,email,phone} }`
- Admin matching will trigger notifications (email/SMS) when a slot opens

## 6) Notifications

- Email (SendGrid) and SMS (Twilio) integrations
- Triggers:
  - appointment.created → email+SMS to client and staff
  - appointment.updated → email+SMS
  - appointment.canceled → email+SMS
  - reminder (24–48h) → SMS/Email
  - followup (post-appointment) → Email

Endpoints (admin):
- POST `/notifications/test-email`
- POST `/notifications/test-sms`

## 7) Client Self-Service Portal (Magic Links)

- POST `/client-portal/link` → input `{ email|phone }` → sends magic link
- GET `/client-portal/appointments?token=...` → `{ upcoming, past }`
- POST `/client-portal/appointments/:id/reschedule?token=...` → `{ appointment }`
- POST `/client-portal/appointments/:id/cancel?token=...` → `{ success: true }`

Policy enforcement:
- `settings.policies.cancellation.cutoffHours` blocks late changes

## 8) Reporting & Analytics

- GET `/reports/sales-summary?startDate&endDate&staffId?`
- GET `/reports/appointments-summary?startDate&endDate&staffId?`
- GET `/reports/top-services?startDate&endDate`
- GET `/reports/top-staff?startDate&endDate`
- Export CSV: add `?format=csv`

## 9) Internationalization & Accessibility (Data)

- All date/time in ISO UTC; provide `timezone` in settings
- Currency provided per business settings; server returns formatted and raw amounts
- Strings translatable client-side; server provides policy text as-is

## Response Shape & Errors

Errors follow FE spec:
```json
{
  "error": { "code": "ERROR_CODE", "message": "...", "details": {} }
}
```


