# Clarity 🚀

**Clarity** is an all-in-one productivity dashboard designed to help you organize your life with precision. It seamlessly integrates habit tracking, goal visualization, and task management into a single, cohesive interface.

![Clarity App Screenshot](/uploaded_image_1767092645787.png)

## ✨ Features

### 🎯 Goal Management
- **Visual Milestones**: Break down big goals into manageable steps.
- **Progress Tracking**: Automatic progress calculation based on completed milestones.
- **Validation**: Smart checks prevent invalid dates or illogical timelines.
- **Rich Details**: Add notes, external resources, and deadlines to every goal.

### 🥗 Habit Tracking
- **Streak System**: Visualize your consistency with daily streaks.
- **Flexible Schedules**: Track daily or specific-day habits.
- **History Protection**: Past habits are read-only to ensure historical accuracy—no cheating!

### ✅ Task Management
- **Prioritization**: High, Medium, and Low priority sorting.
- **Quick Add**: Rapidly capture tasks without leaving the dashboard.
- **Calendar Integration**: Tasks with due dates appear automatically on your daily agenda.

### 📅 Advanced Calendar
- **Unified View**: See events, tasks, goals, and habits in one place.
- **Mobile Optimized**: Custom date strip with auto-centering on "Today".
- **Bi-directional Sync**: (Coming Soon) Google Calendar integration.

### 🎨 Customization & Accessibility
- **Light/Dark Mode**: Fully supported themes with system sync.
- **Responsive Design**: Flawless experience on Desktop, Tablet, and Mobile.
- **PWA Support**: Install as a native app on iOS and Android with offline capabilities.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI (Radix Primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **PWA**: @ducanh2912/next-pwa

**Backend:**
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Auth**: Firebase Authentication (Client SDK)
- **Push Notifications**: Web Push Protocol (VAPID)

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (e.g., Neon)
- Firebase Project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/clarity.git
    cd clarity
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    # Database (Neon)
    DATABASE_URL="postgres://..."

    # Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY="..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="..."
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."

    # Web Push (VAPID)
    NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
    VAPID_PRIVATE_KEY="..."
    VAPID_SUBJECT="mailto:support@clarity.app"
    ```

4.  **Run Migrations:**
    ```bash
    npx drizzle-kit push
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📱 PWA Instructions

To install Clarity as an app:

**iOS:**
1.  Open in Safari.
2.  Tap the **Share** button.
3.  Select **"Add to Home Screen"**.

**Android:**
1.  Open in Chrome.
2.  Tap the **Three Dots** menu.
3.  Select **"Install App"**.

---

## 📂 Project Structure

```
clarity/
├── app/                  # Next.js App Router pages
│   ├── api/              # Backend API routes (cron, push, etc.)
│   ├── (authenticated)/  # Protected routes (dashboard, goals, etc.)
│   └── page.tsx          # Landing page
├── components/           # React Components
│   ├── calendar/         # Calendar-specific logic
│   ├── dashboard/        # Charts and widgets
│   ├── ui/               # Reusable UI components (buttons, dialogs)
│   └── ...
├── lib/                  # Utilities
│   ├── firebase.ts       # Firebase config
│   ├── schema.ts         # Database schema (Drizzle)
│   └── store.tsx         # Global State (Context API)
├── public/               # Static assets & Service Workers
└── drizzle.config.ts     # Database configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature updates.

## 📄 License

This project is licensed under the MIT License.
