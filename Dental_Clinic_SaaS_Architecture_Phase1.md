# Dental Clinic SaaS Architecture (Phase 1)

## Vision

Build a multi-tenant Dental Clinic SaaS using: - Next.js 15 +
TypeScript - Prisma + PostgreSQL - Auth.js - Tailwind CSS + shadcn/ui +
Framer Motion - Flutter (later)

## Development Roadmap

### Phase 1 (Current)

-   Project setup
-   Authentication
-   Multi-tenant SaaS architecture
-   Super Admin dashboard
-   Clinic dashboard
-   Role-based access (Super Admin, Clinic Admin, Receptionist, Doctor)
-   Database schema
-   REST API for future Flutter integration
-   Marketing website
-   APK download page (placeholder)

### Phase 2

-   Patient management
-   Doctors
-   Appointments
-   Billing
-   Prescriptions
-   Reports
-   Notifications
-   Inventory

### Phase 3

Flutter apps: - Patient - Doctor - Reception

Reuse the same Next.js APIs.

## Website Structure

-   Home
-   Features
-   Pricing
-   Book Demo
-   Contact
-   Login
-   Dashboard
-   Download APK
-   FAQ
-   Blog

## SaaS Modules

### Super Admin

-   Clinics
-   Subscriptions
-   Users
-   Analytics
-   System Settings
-   APK Management
-   Monitoring

### Clinic Dashboard

-   Dashboard
-   Patients
-   Doctors
-   Reception
-   Appointments
-   Billing
-   Inventory
-   Reports
-   Settings

## Authentication

-   Auth.js
-   Email/password
-   JWT
-   RBAC
-   Tenant isolation using clinic_id

## Initial REST APIs

-   POST /api/auth/login
-   POST /api/auth/register
-   POST /api/auth/logout
-   GET /api/me
-   GET /api/clinics
-   POST /api/clinics
-   GET /api/patients
-   POST /api/patients
-   GET /api/doctors
-   POST /api/doctors
-   GET /api/appointments
-   POST /api/appointments

These APIs will later be consumed by Flutter.

## Database (Core)

Clinic User Role Patient Doctor Appointment

Every business table contains clinic_id.

## Folder Structure

app/ components/ features/ lib/ prisma/ services/ hooks/ types/ api/

## UI

-   Responsive
-   Framer Motion
-   Glassmorphism
-   Dark/Light mode
-   Reusable components

## Prompt Strategy

1.  Build foundation only.
2.  Finish auth and multi-tenant SaaS.
3.  Finish admin dashboards.
4.  Build REST APIs.
5.  Integrate Flutter apps without changing APIs.

## Goal

A single Vercel deployment for MVP supporting a few clinics, with an
architecture that can later scale to paid hosting.
