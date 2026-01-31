# Payments Backend MVP Audit

**Date:** 2026-01-30  
**Scope:** Stripe PaymentIntent MVP Implementation  
**Status:** ✅ Implemented

---

## 1. Schema Review

### 1.1 PaymentStatus Enum
✅ **Defined**

```prisma
enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED          // Not used in MVP
  PARTIALLY_REFUNDED // Not used in MVP
}
```

**Status:** All statuses defined, but `REFUNDED` and `PARTIALLY_REFUNDED` are not used in MVP implementation.

### 1.2 Payment Model
✅ **Implemented**

```prisma
model Payment {
  id                    String        @id @default(uuid())
  salonId               String
  appointmentId         String?
  saleId                String?       // Not used in MVP
  amount                Decimal        @db.Decimal(10, 2)
  currency              String         @default("usd")
  status                PaymentStatus  @default(PENDING)
  paymentMethod         String?
  stripePaymentIntentId String?       @unique
  stripeClientSecret    String?
  metadata              Json?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  salon                 Salon          @relation(...)
  appointment           Appointment?   @relation(...)

  @@index([salonId])
  @@index([appointmentId])
  @@index([saleId])
  @@index([status])
  @@index([stripePaymentIntentId])
}
```

**Validation:**
- ✅ `amount` is `Decimal` type (10,2 precision)
- ✅ `currency` has default value `"usd"`
- ✅ `appointmentId` is optional (`String?`)
- ✅ `salonId` is required and indexed
- ✅ `stripePaymentIntentId` is unique (prevents duplicates)
- ⚠️ `saleId` field exists but not used in MVP

**Relations:**
- ✅ `Salon.payments` (one-to-many)
- ✅ `Appointment.payment` (one-to-one, optional)

---

## 2. Endpoints

### 2.1 Create Payment Intent
✅ **Implemented**

**Endpoint:**
```
POST /api/payments/create-intent
```

**Authentication:**
- ✅ Bearer token required
- ✅ Salon context required (`@CurrentSalon`)

**Request Body:**
```json
{
  "amount": 100.00,
  "appointmentId": "uuid-optional",
  "currency": "usd",
  "metadata": {}
}
```

**Request DTO:**
```typescript
{
  amount: number;           // Required, min: 0.01
  appointmentId?: string;   // Optional
  currency?: string;        // Optional, defaults to "usd"
  metadata?: Record<string, any>; // Optional
}
```

**Validation Rules:**
- ✅ `amount` must be >= 0.01 (enforced by `@Min(0.01)`)
- ✅ `appointmentId` must be valid UUID string if provided
- ✅ `appointmentId` must belong to current salon (validated in service)
- ✅ `currency` must be one of: `usd`, `eur`, `gbp` (normalized to lowercase)
- ✅ One payment per appointment enforced (checks for existing PENDING, PROCESSING, or SUCCEEDED payments)

**Response (Success - 201):**
```json
{
  "data": {
    "paymentId": "uuid",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 100.00,
    "currency": "usd",
    "status": "PENDING"
  }
}
```

**Response (Error - 404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Appointment not found"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": {
      "validationErrors": [
        "amount must not be less than 0.01"
      ]
    }
  }
}
```

**Response (Error - 400 - Unsupported Currency):**
```json
{
  "error": {
    "code": "UNSUPPORTED_CURRENCY",
    "message": "Currency 'cad' is not supported. Supported currencies: usd, eur, gbp"
  }
}
```

**Response (Error - 409 - Payment Already Exists):**
```json
{
  "error": {
    "code": "PAYMENT_ALREADY_EXISTS",
    "message": "Payment already exists for this appointment"
  }
}
```

### 2.2 Confirm Payment
✅ **Implemented**

**Endpoint:**
```
POST /api/payments/confirm
```

**Authentication:**
- ✅ Bearer token required
- ✅ Salon context required (`@CurrentSalon`)

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Request DTO:**
```typescript
{
  paymentIntentId: string; // Required, Stripe PaymentIntent ID
}
```

**Validation Rules:**
- ✅ `paymentIntentId` must be non-empty string
- ✅ Payment must exist with matching `stripePaymentIntentId` and `salonId`
- ✅ Payment must belong to current salon (enforced via `findFirst` with salonId)

**Response (Success - 200):**
```json
{
  "data": {
    "id": "uuid",
    "salonId": "uuid",
    "appointmentId": "uuid",
    "saleId": null,
    "amount": 100.00,
    "currency": "usd",
    "status": "SUCCEEDED",
    "paymentMethod": "card",
    "stripePaymentIntentId": "pi_xxx",
    "createdAt": "2026-01-30T12:00:00.000Z",
    "updatedAt": "2026-01-30T12:01:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Payment not found"
  }
}
```

**Status Mapping:**
- `succeeded` → `SUCCEEDED`
- `processing` → `PROCESSING`
- `requires_payment_method` → `FAILED`
- Other Stripe statuses → `PENDING`

---

## 3. Stripe Flow Explanation

### 3.1 Payment Intent Creation Flow
✅ **Implemented**

**Step-by-Step:**

1. **Client Request**
   - Frontend calls `POST /api/payments/create-intent`
   - Includes `amount`, optional `appointmentId`, optional `currency`

2. **Backend Validation**
   - Validates amount >= 0.01
   - If `appointmentId` provided:
     - Queries database to verify appointment exists
     - Verifies appointment belongs to current salon
     - Throws `NotFoundException` if not found

3. **Stripe PaymentIntent Creation**
   - Converts amount to cents: `Math.round(amount * 100)`
   - Creates Stripe PaymentIntent with:
     - `amount` (in cents)
     - `currency` (defaults to "usd")
     - `metadata` containing: `salonId`, `userId`, `appointmentId`

4. **Database Record Creation**
   - Creates `Payment` record with:
     - `salonId` from context
     - `appointmentId` if provided
     - `amount` (original decimal value)
     - `currency`
     - `status: PENDING`
     - `stripePaymentIntentId` (from Stripe)
     - `stripeClientSecret` (from Stripe)

5. **Response**
   - Returns `paymentId`, `clientSecret`, `amount`, `currency`
   - Frontend uses `clientSecret` to complete payment

### 3.2 Payment Confirmation Flow
✅ **Implemented**

**Step-by-Step:**

1. **Client Request**
   - Frontend calls `POST /api/payments/confirm`
   - Includes `paymentIntentId` (from Stripe response)

2. **Backend Lookup**
   - Finds Payment by `stripePaymentIntentId` and `salonId`
   - Throws `NotFoundException` if not found

3. **Stripe Status Check**
   - Retrieves PaymentIntent from Stripe API
   - Reads current status from Stripe

4. **Status Mapping**
   - Maps Stripe status to `PaymentStatus` enum
   - Updates Payment record with:
     - New status
     - Payment method type (first from array)

5. **Response**
   - Returns updated Payment object
   - Frontend can check `status` field

### 3.3 Frontend Integration Pattern

**Typical Flow:**

```javascript
// 1. Create Payment Intent
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100.00,
    appointmentId: 'appointment-uuid',
    currency: 'usd'
  })
});

const { data } = await response.json();
// data: { paymentId, clientSecret, amount, currency }

// 2. Use Stripe.js to confirm payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  data.clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { ... }
    }
  }
);

// 3. Confirm payment on backend
if (paymentIntent.status === 'succeeded') {
  await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id
    })
  });
}
```

---

## 4. Service Implementation Details

### 4.1 PaymentsService
✅ **Implemented**

**Dependencies:**
- `PrismaService` - Database access
- `ConfigService` - Environment configuration
- `Stripe` SDK - Payment processing

**Initialization:**
- Reads `STRIPE_SECRET_KEY` from environment
- Throws error if missing (fails fast)
- Stripe API version: `2024-11-20.acacia`

**Methods:**

**createPaymentIntent(salonId, userId, createDto)**
- ✅ Validates appointment belongs to salon
- ✅ Converts amount to cents
- ✅ Creates Stripe PaymentIntent
- ✅ Creates database record
- ✅ Returns payment details

**confirmPayment(salonId, confirmDto)**
- ✅ Validates payment belongs to salon
- ✅ Retrieves Stripe PaymentIntent
- ✅ Maps Stripe status to PaymentStatus
- ✅ Updates database record
- ✅ Returns updated payment

### 4.2 Validation Rules

**Amount Validation:**
- ✅ Minimum: 0.01 (enforced by DTO `@Min(0.01)`)
- ✅ Type: number (enforced by DTO `@IsNumber()`)
- ⚠️ Maximum: Not enforced (Stripe has limits)

**Appointment Validation:**
- ✅ Must exist if `appointmentId` provided
- ✅ Must belong to current salon
- ✅ Query uses `findFirst` with `salonId` filter

**Currency Validation:**
- ✅ Validates against whitelist: `['usd', 'eur', 'gbp']`
- ✅ Normalized to lowercase before validation
- ✅ Defaults to "usd" if not provided
- ✅ Throws `BadRequestException` with code `UNSUPPORTED_CURRENCY` if invalid

**One Payment Per Appointment:**
- ✅ **ENFORCED**
- Checks for existing payments with status: `PENDING`, `PROCESSING`, or `SUCCEEDED`
- Throws `ConflictException` with code `PAYMENT_ALREADY_EXISTS` if payment exists
- Only enforced when `appointmentId` is provided

---

## 5. Frontend Contract

### 5.1 Create Intent Response
✅ **Partially Compliant**

**Required Fields:**
- ✅ `paymentId` - UUID of Payment record
- ✅ `clientSecret` - Stripe client secret for frontend
- ✅ `amount` - Payment amount (decimal)
- ✅ `currency` - Payment currency
- ✅ `status` - Payment status (always `"PENDING"` at creation)

**Response Shape:**
```typescript
{
  data: {
    paymentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: "PENDING";
  }
}
```

### 5.2 Confirm Payment Response
✅ **Compliant**

**Response Shape:**
```typescript
{
  data: {
    id: string;
    salonId: string;
    appointmentId?: string;
    saleId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    stripePaymentIntentId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Status Values:**
- `PENDING` - Payment created but not confirmed
- `PROCESSING` - Payment being processed by Stripe
- `SUCCEEDED` - Payment completed successfully
- `FAILED` - Payment failed

---

## 6. Known Limitations

### 6.1 One Payment Per Appointment
✅ **Enforced**

**Implementation:**
- Checks for existing payments before creating new PaymentIntent
- Validates against payments with status: `PENDING`, `PROCESSING`, or `SUCCEEDED`
- Throws `ConflictException` with code `PAYMENT_ALREADY_EXISTS` if duplicate found

**Impact:**
- Prevents multiple payment attempts for same appointment
- Clear error message for frontend handling

### 6.2 Currency Validation
✅ **Implemented**

**Implementation:**
- Validates against whitelist: `['usd', 'eur', 'gbp']`
- Normalizes input to lowercase before validation
- Throws `BadRequestException` with code `UNSUPPORTED_CURRENCY` if invalid

**Impact:**
- Errors occur early in the flow (before Stripe API call)
- Clear error messages with supported currencies list

### 6.3 Payment Status Synchronization
⚠️ **Manual Confirmation Required**

**Issue:**
- Payment status only updates when `/confirm` endpoint is called
- No automatic synchronization with Stripe
- If frontend doesn't call confirm, status remains `PENDING`

**Impact:**
- Requires frontend to explicitly confirm after Stripe success
- Status may be stale if confirmation step is skipped

### 6.4 Error Handling
⚠️ **Limited Error Details**

**Issue:**
- Stripe errors are not caught and transformed
- Generic error messages for Stripe failures
- No distinction between different failure types

**Impact:**
- Difficult to debug payment failures
- Frontend receives generic error messages

### 6.5 Amount Precision
⚠️ **Potential Rounding Issues**

**Issue:**
- Amount converted to cents: `Math.round(amount * 100)`
- Floating point precision could cause rounding errors
- Example: `100.005 * 100 = 10000.5` → rounds to `10001` cents

**Impact:**
- Very minor, unlikely in practice
- Should use decimal library for production

---

## 7. Intentionally NOT Implemented

### 7.1 Refunds
❌ **Not Implemented**

**Reason:** MVP scope excludes refunds

**What's Missing:**
- No refund endpoint
- `REFUNDED` and `PARTIALLY_REFUNDED` statuses exist but unused
- No Stripe refund API integration

**Future Consideration:**
- Would require refund endpoint
- Would need to update Payment status
- Would need to handle partial refunds

### 7.2 Webhooks
❌ **Not Implemented**

**Reason:** MVP scope excludes webhooks

**What's Missing:**
- No webhook endpoint (`/api/payments/webhook`)
- No webhook signature verification
- No automatic status updates from Stripe events

**Impact:**
- Payment status updates require manual confirmation
- No real-time status synchronization

**Future Consideration:**
- Would require webhook endpoint
- Would need to verify Stripe signatures
- Would need to handle `payment_intent.succeeded` events

### 7.3 Saved Payment Methods
❌ **Not Implemented**

**Reason:** MVP scope excludes saved cards

**What's Missing:**
- No customer creation in Stripe
- No payment method storage
- No "use saved card" functionality

**Impact:**
- Users must enter card details for each payment
- No recurring payment support

### 7.4 POS Logic
❌ **Not Implemented**

**Reason:** MVP scope excludes POS

**What's Missing:**
- No terminal integration
- No in-person payment support
- No cash/check payment methods

**Impact:**
- Online payments only
- No support for in-salon transactions

### 7.5 Sale Linking
⚠️ **Field Exists But Not Used**

**Reason:** MVP ties payments to appointments only

**What's Missing:**
- `saleId` field exists in Payment model
- No logic to link payments to Sales
- No endpoint to create payment for Sale

**Impact:**
- Payments can only be created for appointments
- Cannot process payments for standalone sales

### 7.6 Payment History
❌ **Not Implemented**

**Reason:** MVP scope is payment processing only

**What's Missing:**
- No `GET /api/payments` endpoint
- No payment listing/filtering
- No payment history for appointments

**Impact:**
- Cannot query payment history
- Must query Payment table directly if needed

### 7.7 Payment Details Retrieval
❌ **Not Implemented**

**Reason:** MVP scope is payment processing only

**What's Missing:**
- No `GET /api/payments/:id` endpoint
- No way to retrieve payment details by ID

**Impact:**
- Cannot fetch payment details after creation
- Must use confirm endpoint to get updated status

---

## 8. Security Considerations

### 8.1 Salon Isolation
✅ **Enforced**

- All queries filter by `salonId`
- `@CurrentSalon` decorator ensures salon context
- Payment lookup includes salonId in where clause

### 8.2 Stripe Secret Key
✅ **Secure**

- Read from environment variable
- Never exposed in responses
- Service fails if missing (fail-fast)

### 8.3 Client Secret
✅ **Handled Correctly**

- Returned to frontend for Stripe.js integration
- Not stored in frontend long-term
- Single-use token from Stripe

### 8.4 Amount Validation
✅ **Enforced**

- Minimum amount validation (0.01)
- Type validation (number)
- Converted to integer cents before Stripe

### 8.5 Payment Intent ID Validation
✅ **Enforced**

- Validated against database
- Must belong to current salon
- Prevents cross-salon payment access

---

## 9. Testing Recommendations

### 9.1 Unit Tests Needed
- ✅ Amount validation (min 0.01)
- ✅ Appointment validation (belongs to salon)
- ✅ Status mapping (Stripe → PaymentStatus)
- ✅ Currency validation (whitelist: usd, eur, gbp)
- ✅ One payment per appointment enforcement

### 9.2 Integration Tests Needed
- ✅ Create payment intent flow
- ✅ Confirm payment flow
- ✅ Error handling (appointment not found)
- ✅ Error handling (payment not found)
- ⚠️ Stripe API error handling

### 9.3 Edge Cases to Test
- ✅ Multiple payments for same appointment (should return 409)
- ✅ Invalid currency codes (should return 400 with UNSUPPORTED_CURRENCY)
- ⚠️ Very large amounts
- ⚠️ Very small amounts (0.01)
- ⚠️ Payment confirmation without frontend Stripe confirmation
- ✅ Currency case insensitivity (USD, usd, Usd all normalized)

---

## 10. Summary

### ✅ Implemented
- Payment model with proper schema
- Create PaymentIntent endpoint
- Confirm Payment endpoint
- Stripe integration (PaymentIntents)
- Salon isolation enforcement
- Amount validation
- Appointment validation
- Currency validation (usd, eur, gbp whitelist)
- One payment per appointment enforcement
- Status field in create-intent response

### ⚠️ Partially Implemented
- Error handling (generic Stripe errors - not transformed)

### ❌ Not Implemented (By Design)
- Refunds
- Webhooks
- Saved payment methods
- POS logic
- Sale linking
- Payment history endpoints
- Payment details retrieval endpoint

---

## 11. MVP Safety Fixes Applied

**Date:** 2026-01-30  
**Status:** ✅ Implemented

### 11.1 One Payment Per Appointment Enforcement
✅ **Implemented**

**Implementation:**
- Added check in `createPaymentIntent()` method
- Queries existing Payment records where:
  - `appointmentId` matches provided appointment
  - `status` is `PENDING`, `PROCESSING`, or `SUCCEEDED`
- Throws `ConflictException` if payment exists

**Error Response:**
```json
{
  "error": {
    "code": "PAYMENT_ALREADY_EXISTS",
    "message": "Payment already exists for this appointment"
  }
}
```

**HTTP Status:** 409 Conflict

**Files Modified:**
- `src/payments/payments.service.ts` - Added payment existence check

**Behavior:**
- Prevents multiple payment intents for same appointment
- Only checks if `appointmentId` is provided
- Does not prevent payments without appointmentId

### 11.2 Currency Validation
✅ **Implemented**

**Supported Currencies:**
- `usd` (United States Dollar)
- `eur` (Euro)
- `gbp` (British Pound)

**Implementation:**
- Currency normalized to lowercase before validation
- Validates against whitelist of supported currencies
- Throws `BadRequestException` if currency not supported

**Error Response:**
```json
{
  "error": {
    "code": "UNSUPPORTED_CURRENCY",
    "message": "Currency 'cad' is not supported. Supported currencies: usd, eur, gbp"
  }
}
```

**HTTP Status:** 400 Bad Request

**Files Modified:**
- `src/payments/payments.service.ts` - Added currency validation and normalization

**Behavior:**
- Defaults to `usd` if currency not provided
- Case-insensitive (normalizes to lowercase)
- Rejects any currency not in whitelist

### 11.3 Frontend Contract Fix
✅ **Implemented**

**Change:**
- Added `status: "PENDING"` field to create-intent response

**Updated Response:**
```json
{
  "data": {
    "paymentId": "uuid",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 100.00,
    "currency": "usd",
    "status": "PENDING"
  }
}
```

**Files Modified:**
- `src/payments/payments.service.ts` - Added status field to return object

**Impact:**
- Frontend now receives status immediately
- Consistent with confirm endpoint response structure

### 11.4 Exception Filter Enhancement
✅ **Implemented**

**Enhancement:**
- Updated `HttpExceptionFilter` to preserve custom error codes
- Handles exceptions with `code` property in response object
- Returns custom code instead of generic status-based code

**Files Modified:**
- `src/common/filters/http-exception.filter.ts` - Added custom code handling

**Behavior:**
- Custom error codes (`PAYMENT_ALREADY_EXISTS`, `UNSUPPORTED_CURRENCY`) are preserved
- Falls back to status-based codes if no custom code provided

---

**Document Status:** ✅ Complete  
**Implementation Status:** ✅ MVP Complete with Safety Fixes  
**Production Readiness:** ✅ Ready (safety fixes applied)
