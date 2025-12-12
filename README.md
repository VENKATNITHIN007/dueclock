✅ DUECLOCK — CA Due Date Tracking Web App

Problem:
CAs repeatedly handle the same monthly due dates and struggle to track all clients and communicate deadlines using WhatsApp/Excel. No mobile-friendly compliance tool exists.

so I Built a clean, mobile-first PWA that automates recurring due dates, manages clients, tracks compliance status, and communication easy all in one simple dashboard.

🔗 Live Demo

https://dueclock.in


Tech Stacks used:

Next.js (App Router)
,React
,TailwindCSS
,MongoDB
,NextAuth / Sessions
,Middleware for protected routes
,React Query (for server state + API fetching)
,Zod (validation)
,Fetch
,cloud hosting on Vercel

---
🔒 Authentication Flow (Simple Explanation)

Uses session-based auth via NextAuth

JWT used inside the session for API validation

Middleware protects all dashboard routes

Users must be logged in to access any data

---

🧪 Validation

All forms are validated using Zod, ensuring:

Correct client details
,Valid due date formats
,Safe API requests

---

✨ Features

👥 Client management

📝 Track compliance deadlines,automatic creating of next duedates

📊 Dashboard with all urgent,overdue,completed dates

🔄 Automatic refetch using React Query

📱 Fully responsive UI using Tailwind


📂 Folder Structure

  /app
    /api
      /auth 
      /clients
      /dashboard
      /duedate
      /user
    /app   
      /clients
      /dashboard
      /duedates
      /user
  /components
    /auth
    /dialogs
    /duedatecontent
    /forms
    /layout
    /ui
  /hooks
    /client
    /dashboard
    /due
    /user
  /lib
    /auth
    /db
    /utils
    /querykeys
  /models
    Audit.ts
    Client.ts
    DueDate.ts
    Firm.ts
    User.ts
    Subscription.ts
  /schemas
    formschemas.ts
    apischemas
  /public

---

⚙ Environment Variables

Create a .env file with:

MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID= (optional)
GOOGLE_CLIENT_SECRET= (optional)

(Replace with your own credentials.)

🚀 Installation

1. Clone repository
git clone https://github.com/yourusername/dueclock.git

cd dueclock

3. Install dependencies

npm install

4. Run development server

npm run dev

App will run at:
http://localhost:3000


📖 Usage Guide

1. Register / Login with google
  
3. Add a clients
4. Create Due Dates for each client
5. View all deadlines on dashboard
6. Edit / delete due dates anytime
7. Search or filter upcoming deadlines
8. contact using contact feature
9. automatic next due date creation on completion of date for recurssive dates
10.you can install dueclock add to home schreen feature form browser


📈 Future Improvements
🔔 Automatic reminder notifications
📱 Push notifications (PWA)
👨‍💼 User roles (Admin / Staff)
📨 Email reminders
📅 Calendar view
⚙ Folder-level permissions
🧾 Client import/export via CSV


---

🪪 License

MIT License


---
