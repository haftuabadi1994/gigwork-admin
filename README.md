# GigWork Admin Portal — Standalone React App

A dedicated React + Vite admin dashboard running on port **4000**, separate from the worker app.

---

## Setup

```bash
cd gigwork-admin
npm install
npm run dev
```

Opens at **http://localhost:4000** (or `http://10.10.3.209:4000` on LAN).

---

## Login

Only users with `role: "admin"` can access this portal.

| Email             | Password     |
|-------------------|--------------|
| admin@gigwork.et  | admin123456  |

---

## Pages

| Page              | Path           | Description |
|-------------------|----------------|-------------|
| Dashboard         | /dashboard     | Stats, earnings chart, recent activity |
| Analytics         | /analytics     | 30/90-day charts with recharts, top earners |
| Users             | /users         | Full CRUD — edit level, quality, wallet, ban |
| Tasks             | /tasks         | Create/edit/delete tasks with trailer video, review submissions |
| Withdrawals       | /withdrawals   | Approve/reject with admin notes |
| Deposits          | /deposits      | Review receipts, approve & credit wallet |
| Transactions      | /transactions  | Full immutable ledger |
| Handbook & Levels | /handbook      | Edit employee guide + all 11 level income rules |
| Broadcast         | /broadcast     | Send notifications to all workers |
| Team & Referrals  | /team          | Leaderboard + manual bonus crediting |
| Statements        | /statements    | Generate & download CSV by date or user |
| Settings          | /settings      | Exchange rate, maintenance mode, payment methods |

---

## Backend proxy

`vite.config.js` proxies `/api` calls to `http://10.10.3.209:5000`. Update the IP if your backend is elsewhere.

---

## Build for production

```bash
npm run build
# Output in dist/ — serve with nginx or any static host
```
