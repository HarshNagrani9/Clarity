# Clarity ⚡️
The definitive operating system for high-performers. Turn ambiguous goals into data-driven streaks.

## Features & Recent Updates

### 🔐 Security & Auth
- **Strict Route Protection**: Dashboard routes (`/dashboard`) are now protected by a strict client-side auth guard. Unauthenticated users are immediately redirected to login.
- **Guest Access (Demo Mode)**: A "Guest Access" feature is available for demo purposes. Users can unlock guest credentials (`guest@gmail.com`) via an interactive envelope UI on the landing page.

### 🎨 UI/UX Enhancements
- **Dynamic Favicon**: Replaced default Vercel branding with a custom, dynamically generated "Lightning Bolt" favicon (Lime-400 on Black) in `app/icon.tsx`.
- **Brutalist Design System**: Utilizing a consistent brutalist design language with sharp borders, neon accents (Lime/Cyan), and interactive animations.

### 📱 Responsive
- Optimized Hero section with a mobile-first approach, ensuring CTAs like "Escape the Chaos" are accessible on all devices.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Firebase Authentication
- **Icons**: Lucide React
