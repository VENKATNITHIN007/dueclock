📌 DueClock – CA Due Date Tracking App(Pwa)

Problem:
CAs repeatedly handle the same monthly due dates and struggle to track all clients and communicate deadlines using WhatsApp/Excel. No mobile-friendly compliance tool exists.

so I Built a clean, mobile-first PWA that automates recurring due dates, manages clients, tracks compliance status, and communication easy all in one simple dashboard.

🔗 Live Demo

https://dueclock.in


Tech Stacks used:

Next.js (App Router)

React

TailwindCSS

MongoDB

NextAuth / Sessions

Middleware for protected routes

React Query (for server state + API fetching)

Zod (validation)

Axios / Fetch

cloud hosting on Vercel

---
🔒 Authentication Flow (Simple Explanation)

Uses session-based auth via NextAuth
JWT used inside the session for API validation
Middleware protects all dashboard routes
Users must be logged in to access any data

---

❓ Why I Built It

Some CA firms even today use Excel or WhatsApp for recurring deadlines — unreliable and hard to manage,
DueClock solves this by giving them an Organized workflow , Simple dashboard , Reliable due-date manager It is Built as an MVP to test real user needs.

---

🔗 Live Demo: https://dueclock.in

Next.js + MongoDB + NextAuth + TailwindCSS + shadcn/ui + React Query + Zod — deployed on Vercel

---

✨ MVP Features

⦁	Fast and secure login using google

⦁	Automatic next duedate creation after completing duedate

⦁	Easy client communication using whatsapp or email

⦁	It is Pwa, can be installed like normal app from browser


---
🟦 Why shadcn/ui (forms, dialogs, UI components)?

It Works perfectly with React Hook Form, Great for MVP where time matters

---

🟧 Why React Query?

I wanted fast reactive UI changes (toggle status) , react query is best for optimistic updates and saves lots of trouble in fetching response and manging error states

---

🟩 Why Zod?

To validate client and duedates forms and while caching api response , its easy and saves lots of trouble form bad data 

---

🟨 Why Google Auth + JWT + Session?

✔️ Session cookie → secure login for web dashboards

✔️ JWT inside session → fast API authorization

✔️ Google OAuth → easy one-click login

---


📂 Folder Structure


 ├─ app/
 │   ├─ api/
 │   │   ├─ auth/
 │   │   ├─ clients/
 │   │   ├─ dashboard/
 │   │   ├─ duedate/
 │   │   └─ user/
 │   ├─ clients/
 │   ├─ dashboard/
 │   ├─ duedates/
 │   └─ user/
 │
 ├─ components/
 │   ├─ auth/
 │   ├─ dialogs/
 │   ├─ duedatecontent/
 │   ├─ forms/
 │   ├─ layout/
 │   └─ ui/        # shadcn components
 │
 ├─ hooks/
 │   ├─ client/
 │   ├─ dashboard/
 │   ├─ due/
 │   └─ user/
 │
 ├─ lib/
 │   ├─ auth/
 │   ├─ db/
 │   ├─ utils/
 │   └─ querykeys/
 │
 ├─ models/
 │   ├─ User.ts
 │   ├─ Client.ts
 │   ├─ Firm.ts
 │   ├─ DueDate.ts
 │   ├─ Subscription.ts
 │   └─ Audit.ts
 │
 ├─ schemas/
 │   ├─ formschemas.ts
 │   └─ apischemas.ts
 │
 └─ public/


---

⚙ Environment Variables

Create a .env file with:

MONGODB_URI=

NEXTAUTH_SECRET=

NEXTAUTH_URL=

GOOGLE_CLIENT_ID= (optional)

GOOGLE_CLIENT_SECRET= (optional)

(Replace with your own credentials.)

----

🚀 Installation

git clone https://github.com/VENKATNITHIN007/cahelp

cd cahelp

npm install

npm run dev

---

📈 Future Improvements

🔔 Automatic reminder notifications

👨‍💼 User roles (Admin / Staff) for firms

🧾 Client import via CSV



