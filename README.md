# CloudVault Frontend

A modern, responsive frontend for the CloudVault cloud storage and messaging platform.

## Features

- 🎨 **Modern UI** - Built with Next.js 16, React 19, and Tailwind CSS 4
- 🧩 **Component Library** - Comprehensive UI components using shadcn/ui and Radix UI
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode** - Built-in dark mode support with next-themes
- 📁 **File Management** - Upload, download, and organize files with folder support
- 💬 **Messaging System** - Public messaging with sender attribution
- 🔍 **Search** - Real-time search across messages, files, and folders
- 📊 **Statistics Dashboard** - View storage usage, download counts, and more

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion + Tailwind Animate

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cloudvault-frontend.git
cd cloudvault-frontend

# Install dependencies
bun install

# Create environment file
cp .env.example .env.local

# Start development server
bun run dev
```

## Environment Variables

Create a `.env.local` file with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

## Project Structure

```
cloudvault-frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── public/              # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Known Issues

- TypeScript build errors are ignored in development mode
- Large file uploads may require server configuration adjustments
- Some components may need additional accessibility improvements

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
