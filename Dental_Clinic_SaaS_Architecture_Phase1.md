We have completed the marketing website, landing pages, UI components, and basic dashboard layouts.

Now focus ONLY on the backend foundation and authentication. Do NOT build patient management, appointments, billing, inventory, or other business modules yet.

## Objectives

Convert the project into a production-ready multi-tenant SaaS.

## Authentication

Implement Auth.js with:

- Login
- Register Clinic
- Forgot Password
- Reset Password
- Email Verification
- Change Password
- Logout
- Remember Me
- Session Management

Use secure password hashing and JWT/session authentication.

---

## Multi-Tenant SaaS

This application must support multiple dental clinics.

Each clinic has completely isolated data.

Every business table must contain:

- clinic_id

Users should NEVER be able to access another clinic's data.

---

## User Roles

Implement Role-Based Access Control (RBAC).

Roles:

- Super Admin
- Clinic Admin
- Doctor
- Receptionist

Each role should have middleware protection.

---

## Super Admin

Create backend functionality for:

- Create Clinic
- Edit Clinic
- Delete Clinic
- Suspend Clinic
- Activate Clinic

Each clinic should have:

- Name
- Logo
- Email
- Phone
- Address
- Subscription Status
- Created Date

---

## Register Clinic Flow

When a new clinic registers:

Automatically create:

- Clinic
- Clinic Admin account
- Default Settings
- Default Roles

The Clinic Admin should receive full access only to their own clinic.

---

## Database

Create Prisma schema for:

Clinic

User

Role

Permission

Subscription

Settings

Session

Audit Log

Use proper relationships and indexes.

---

## APIs

Create REST APIs for:

Authentication

Current User

Clinics

Users

Roles

Permissions

Settings

These APIs will be reused by future modules.

---

## Middleware

Implement middleware for:

Authentication

Role Authorization

Tenant Isolation

Protected Routes

---

## Dashboard

Connect dashboard cards to real database values.

Example:

Total Clinics

Active Clinics

Total Users

Online Users

Subscription Status

---

## Settings

Clinic Settings

Profile

Logo

Business Information

Timezone

Language

Theme

---

## File Upload

Implement secure uploads for:

Clinic Logo

User Avatar

Store files using the existing storage configuration.

---

## Error Handling

Centralized API responses.

Validation using Zod.

Global error handler.

Proper HTTP status codes.

---

## Security

Protected API routes

CSRF protection

Rate limiting

Input validation

Secure cookies

Password hashing

Audit logging

---

## Code Quality

Use feature-based architecture.

Keep reusable services.

Use TypeScript best practices.

Write clean, scalable code.

Do NOT build Patients, Doctors, Appointments, Billing, Inventory, or Reports yet.

Only complete the SaaS backend foundation so future modules can plug into it without refactoring.