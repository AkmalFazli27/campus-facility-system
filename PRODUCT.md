# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are campus community members, including students, lecturers, and staff, who need to check facility availability, reserve campus facilities, or report damage. Facility officers and administrators are operational users who process reservations and reports, manage facility and account data, and review summaries.

The product supports four roles: visitor, user, officer, and admin. Visitors can browse facility availability without logging in. Authenticated users manage their own reservations and damage reports. Officers process operational queues. Admins manage master data, accounts, and exports.

## Product Purpose

The product provides one web-based source of truth for campus facility availability, reservations, damage reports, operational queues, and PDF summaries. Success means campus users can complete the reservation and reporting workflows without fragmented manual coordination, while officers and admins can process work and review facility usage reliably.

## Positioning

The product combines a public facility catalogue and availability view with authenticated reservations, damage reporting, officer processing queues, facility maintenance status, and administrative PDF summaries in one campus facility workflow.

## Operating Context

The system is used through a browser by campus users and facility operations staff. Facility reservations use one-day schedules in the Asia/Jakarta timezone, with operating hours from 07:00 to 20:00 and fixed 30-minute slots. Officers work from queues for reservations and damage reports. Admins use master-data, account-verification, and reporting workflows.

## Capabilities and Constraints

- The MVP includes authentication, registration, login, logout, facility catalogue and filtering, per-slot availability, reservations, reservation history, reservation cancellation, damage reports with one photo, report status tracking, officer processing, maintenance status, facility management, account management, account verification, and PDF exports.
- Server-side validation is authoritative for important forms, reservation hours and slot boundaries, facility status, permissions, and reservation conflict prevention. Client validation is for user experience only.
- The application is a web-only MVP built with Next.js 16, React 19, TypeScript, App Router, MySQL 8, Prisma 6, and PDF export.
- The MVP uses four roles: visitor, user, officer, and admin.
- Reservation operating hours are 07:00-20:00 Asia/Jakarta in 30-minute increments. Approved reservations for the same facility and date must not overlap.
- PDF is the required reporting export for the MVP.
- Payments, campus SSO, native mobile applications, WhatsApp or push notifications, external calendar integrations, and granular equipment inventory are out of scope before the UTS release.
- Development uses a local MySQL database. The shared Aiven database is reserved for integration and demonstration, not daily development.

## Evidence on Hand

- Product requirements and user stories: `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md`
- Project setup and database workflow: `README.md`
- Current application entry point: `app/page.tsx`
- Database schema: `prisma/schema.prisma`
- Seed/demo account documentation: `README.md` and the PRD appendices

The repository currently contains the default Next.js starter homepage, so the complete product workflows are not yet represented by the current home surface.

## Product Principles

- Give campus users a single, dependable place to understand facility availability and request access.
- Keep operational status visible and actionable for officers and admins.
- Treat server-side authorization, validation, and conflict prevention as non-negotiable product behavior.
- Preserve privacy by exposing availability without exposing other users' reservation details to visitors.
- Prefer a focused, demonstrable MVP over integrations that are explicitly out of scope.

## Accessibility & Inclusion

The product is a browser-based system for a broad campus audience. Interfaces should support clear role-specific status messages, understandable validation errors, keyboard-accessible controls, and responsive use on common desktop and mobile web viewports. A more specific accessibility standard is not yet established in the product requirements.
