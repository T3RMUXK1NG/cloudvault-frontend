# ☁️ CloudVault Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> A modern, responsive frontend for the **CloudVault** cloud storage and messaging platform. Built by [T3rmuxk1ng](https://youtube.com/@T3rmuxk1ng).

---

## ✨ Features

- 🎨 **Modern UI** — Built with Next.js 16, React 19, and Tailwind CSS 4
- 🧩 **Component Library** — 50+ shadcn/ui components powered by Radix UI
- 📱 **Responsive Design** — Seamless experience on desktop and mobile
- 🌙 **Dark Mode** — Built-in dark mode with next-themes
- 📁 **File Management** — Upload, download, and organize files with drag-and-drop
- 💬 **Messaging System** — Real-time public messaging with sender attribution
- 🔍 **Search** — Instant search across messages, files, and folders
- 📊 **Stats Dashboard** — Storage usage, download counts at a glance
- 🗂️ **Folder Navigation** — Nested folder sidebar with file counts
- 🖼️ **Grid & List Views** — Toggle between grid and list file views
- 🎭 **Framer Motion** — Smooth animations and transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router & SSR framework |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Zustand** | Lightweight state management |
| **React Hook Form + Zod** | Forms & validation |
| **TanStack Query** | Server state management |
| **TanStack Table** | Data tables |
| **Recharts** | Charts & data visualization |
| **Framer Motion** | Animations |
| **Lucide React** | Icon library |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/T3RMUXK1NG/cloudvault-frontend.git
cd cloudvault-frontend

# Install dependencies
bun install

# Create environment file
cp .env.example .env.local

# Start development server
bun run dev
```

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

---

## 📁 Project Structure

```
cloudvault-frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout with fonts & toaster
│   │   ├── page.tsx      # Main CloudVault UI
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   └── ui/           # 50+ shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts      # Utility functions (cn, etc.)
├── public/               # Static assets
│   ├── logo.svg
│   └── robots.txt
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🔗 Companion Backend

This frontend pairs with [CloudVault Backend](https://github.com/T3RMUXK1NG/cloudvault-backend) — a Next.js API with Prisma ORM and SQLite.

---

## 📺 YouTube

> Learn how this project was built! Watch tutorials on **[T3rmuxk1ng YouTube Channel](https://youtube.com/@T3rmuxk1ng)**

---

## 👤 Author

**RS T3RMUXK1NG | T3rmuxk1ng**

- YouTube: [https://youtube.com/@T3rmuxk1ng](https://youtube.com/@T3rmuxk1ng)
- GitHub: [T3RMUXK1NG](https://github.com/T3RMUXK1NG)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**If you found this project useful, give it a star!**

[YouTube](https://youtube.com/@T3rmuxk1ng) | [GitHub](https://github.com/T3RMUXK1NG)

</div>
