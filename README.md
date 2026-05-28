# GDD — Global Direct Debit Dashboard

Mandate management and direct debit orchestration platform. Built with **Next.js 14 App Router**, TypeScript.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Variables (design tokens in `globals.css`) + inline styles
- **Fonts:** DM Sans + IBM Plex Mono (Google Fonts)
- **Package manager:** pnpm (recommended) or npm

---

## Getting Started

```bash
# Install dependencies
pnpm install   # or: npm install

# Run dev server
pnpm dev       # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects automatically to `/dashboard`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Redirects → /dashboard
│   ├── globals.css         # Design tokens (CSS vars) + global resets
│   └── dashboard/
│       └── page.tsx        # Dashboard route
│
├── components/
│   ├── GDDDashboard.tsx    # Root client shell (page router)
│   ├── Sidebar.tsx         # Collapsible nav
│   ├── Topbar.tsx          # Header bar (search, WS indicator, avatar)
│   ├── ui/
│   │   └── index.tsx       # Shared primitives: Badge, StatCard, Table, Modal, Field, Input, Select
│   └── pages/
│       ├── DashboardPage.tsx   # Overview, failed requests, provider health, live feed
│       ├── MandatesPage.tsx    # Mandate ledger + create mandate modal
│       └── OtherPages.tsx      # Activations, Debits, Providers, BankLogs, Revenue, Users
│
└── lib/
    └── data.ts             # Types, mock data, helpers (fmt, fmtK, genMandateRef)
```

---

## Pages

| Route (internal) | Page | Description |
|---|---|---|
| `dashboard` | Dashboard | Stats, failed requests, provider health, live WebSocket feed |
| `mandates` | Mandates | Master ledger — create, filter, search mandates |
| `activations` | Activations | MAN activation report (₦50 fee per mandate) |
| `debits` | Debit Requests | Pull payment log with throttle/fail/success states |
| `providers` | Providers | Bank registry — client ID/secret, token TTL, IP whitelist |
| `bank-logs` | Bank Logs | Raw API log (direction, event, HTTP status, latency) |
| `revenue` | Revenue | Activation revenue + debit volume + per-provider breakdown |
| `users` | User Management | RBAC roles + user table |

---

## Design Tokens

All colours defined in `src/app/globals.css` as CSS custom properties:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0A0B0D` | Page background |
| `--surface` | `#111318` | Cards, sidebar |
| `--border` | `#1E2330` | Dividers |
| `--text` | `#E8E4DC` | Primary text |
| `--amber` | `#F5A623` | Brand accent |
| `--green` | `#22C55E` | Success |
| `--red` | `#EF4444` | Error/failed |
| `--purple` | `#A855F7` | Throttled/roles |

---

## Next Steps (Backend Integration)

Replace mock data in `src/lib/data.ts` with real API calls:

- `GET /api/mandates` — mandate ledger
- `POST /api/mandates` — create mandate (sends to GDD API)
- `GET /api/debits` — debit request log
- `GET /api/providers` — provider registry
- `POST /api/providers/:id/refresh-token` — OAuth token refresh
- `GET /api/logs` — bank API logs
- `GET /api/revenue` — revenue report
- `WS /ws` — real-time debit status feed

---

## White-Label Configuration

To rebrand for a client:

1. Update `metadata` in `src/app/layout.tsx` (title, description)
2. Change the `G` logo letter and `GDD` wordmark in `src/components/Sidebar.tsx`
3. Adjust `--amber` in `globals.css` to the client's brand colour
4. Update destination account in `src/components/Topbar.tsx`
