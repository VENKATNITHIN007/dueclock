# DueClock – CA Due Date Tracking App

A clean, mobile-first PWA that helps Chartered Accountants track recurring compliance deadlines, manage clients, and communicate easily—all in one simple dashboard.

**Live Demo:** [https://dueclock.in](https://dueclock.in)

---

## The Problem

CAs repeatedly handle the same monthly due dates and struggle to track all clients while communicating deadlines via WhatsApp and Excel. No mobile-friendly compliance tool exists.

So I built DueClock—a simple dashboard that automates recurring due dates, manages clients, tracks compliance status, and makes communication effortless.

---

## Tech Stack

- Next.js (App Router)
- React
- TailwindCSS
- MongoDB
- NextAuth / Sessions
- React Query (server state + API fetching)
- Zod (validation)
- Axios
- Vercel (hosting)

---

## Authentication

Session-based auth via NextAuth with JWT inside the session for API validation. Middleware protects all dashboard routes—users must be logged in to access any data.

---

## Why I Built It

Some CA firms still use Excel or WhatsApp for recurring deadlines, which is unreliable and hard to manage. DueClock gives them an organized workflow, simple dashboard, and reliable due-date manager. Built as an MVP to test real user needs.

---

## Features

- Fast and secure Google login
- Automatic next due date creation after completing a deadline
- Easy client communication via WhatsApp or email
- PWA—can be installed like a native app from the browser

---

## Why These Tools?

**shadcn/ui** – Works perfectly with React Hook Form. Great for MVPs where time matters.

**React Query** – Fast reactive UI changes with optimistic updates. Saves trouble fetching responses and managing error states.

**Zod** – Validates client and due date forms, plus API responses. Easy and prevents bad data.

**Google Auth + JWT + Session** – Secure login for web dashboards with fast API authorization and one-click Google OAuth.

---

## Folder Structure

```
app/
├── api/
│   ├── auth/
│   ├── clients/
│   ├── dashboard/
│   ├── duedate/
│   └── user/
├── clients/
├── dashboard/
├── duedates/
└── user/

components/
├── auth/
├── dialogs/
├── duedatecontent/
├── forms/
├── layout/
└── ui/        # shadcn components

hooks/
├── client/
├── dashboard/
├── due/
└── user/

lib/
├── auth/
├── db/
├── utils/
└── querykeys/

models/
├── User.ts
├── Client.ts
├── Firm.ts
├── DueDate.ts
├── Subscription.ts
└── Audit.ts

schemas/
├── formschemas.ts
└── apischemas.ts

public/
```

---

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=      # optional
GOOGLE_CLIENT_SECRET=  # optional
```

---

## Installation

```bash
git clone https://github.com/VENKATNITHIN007/cahelp
cd cahelp
npm install
npm run dev
```

---

## Future Improvements

- Automatic reminder notifications
- User roles (Admin / Staff) for firms
- Client import via CSV
