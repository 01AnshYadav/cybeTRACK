# CyberSync

A cybersecurity learning platform for tracking your progress long-term.

## Purpose

CyberSync helps you track your cybersecurity learning growth, master new concepts, and stay ready for the evolving threat landscape. Build lasting security skills over time with a centralized platform for profile management, interest tracking, and progress visualization.

## Key Features

- **Authentication**: Secure sign up and login via Supabase
- **Profile Management**: Update display name, bio, GitHub username, and cybersecurity interests
- **Dashboard**: View your profile summary and connected GitHub account
- **Interest Tracking**: Select and track your areas of focus (Network Security, Cryptography, Forensics, Web Security)
- **Protected Routes**: Middleware-based authentication guarding dashboard and profile routes
- **Responsive Design**: Dark mode support with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS v4
- **Backend**: Supabase (Auth + PostgREST + RLS)
- **Fonts**: Geist (Vercel)
- **Components**: Custom UI components (button, card, input)

## Project Structure

```
cyber-sync/
├── app/              # Next.js 13+ App Router
│   ├── layout.tsx    # Root layout with Geist fonts
│   ├── page.tsx      # Home page with onboarding
│   ├── login/        # Login page
│   ├── signup/       # Signup page
│   ├── profile/      # User profile editing page
│   └── dashboard/    # Protected dashboard view
├── components/       # UI components (button, card, input)
├── lib/              # Supabase client and TypeScript types
│   ├── supabase.ts   # Server Supabase client
│   └── types/        # Database type definitions (ProfileRow)
├── supabase/         # SQL migrations and RLS policies
├── .env.example      # Environment variable templates
├── next.config.ts    # Next.js configuration
├── proxy.ts          # Middleware for route protection
└── package.json      # Dependencies and scripts
```

## How It Works

- **Authentication**: Supabase Auth handles sign up, login, and session management
- **Data Storage**: User profiles stored in Supabase `public.profiles` table with Row Level Security
- **Route Protection**: `proxy.ts` middleware redirects unauthenticated users from `/dashboard` and `/profile` to `/login`
- **On Signup**: A profile row is automatically created on user registration; users can later edit it via the profile page
- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` required for Supabase integration

## Installation & Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (`next dev`) |
| `npm run build` | Build for production (`next build`) |
| `npm run start` | Start production server (`next start`) |
| `npm run lint` | Run ESLint |

## Environment Variables

See `.env.example` for required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are exposed to the frontend (prefixed with `NEXT_PUBLIC_`) as this is a client-facing Next.js app.

## Database

The project uses Supabase with a `profiles` table defined in `supabase/20260819000001_create_profiles_table.sql`. Row Level Security policies allow:

- Everyone to view profiles
- Authenticated users to insert/update their own profile

## Deployment

Easily deploy to [Vercel](https://vercel.com) from the project root. The platform automatically handles Next.js builds and environment variables configured in the dashboard.

## Current Status

**v0.1.0 - Foundation**

Core authentication, profile management, and dashboard are implemented. Additional features are planned for future roadmap updates.

## Future Improvements

- GitHub repository integration and contribution tracking
- Learning progress metrics and streaks
- Community features (forums, shared learning paths)
- Advanced interest filtering and recommendations
- Mobile responsiveness improvements

## Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests. For major changes, discuss what you would like to change via an issue first.

Ensure your code follows the project's TypeScript and Tailwind CSS conventions, and update tests as appropriate.

## License

No license file is present in the repository. This project is for personal/learning use unless otherwise indicated.