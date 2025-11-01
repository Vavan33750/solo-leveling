# Progression Hero

A Progressive Web App (PWA) for tracking personal objectives and missions, built with React, TypeScript, Vite, and Supabase.

## Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Objective Management**: Create, edit, and track personal objectives
- **Mission Tracking**: Manage daily missions and tasks
- **Schedule Planning**: Organize schedules and routines
- **Progress Statistics**: View detailed progress analytics
- **PWA Support**: Installable as a native app on mobile devices
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + Auth)
- **State Management**: Zustand
- **PWA**: Vite PWA plugin
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vavan33750/solo-leveling.git
   cd solo-leveling
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Database Setup**
   - Run the SQL schema in `supabase-schema.sql` in your Supabase project
   - Apply RLS policies from `supabase-rls.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Preview production build**
   ```bash
   npm run preview
   ```

## Deployment Guide

### Vercel Deployment

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository: `Vavan33750/solo-leveling`

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   Set the following environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Vercel will automatically deploy on every push to the main branch
   - Your app will be available at `https://your-project-name.vercel.app`

### Manual Deployment

You can also deploy to other platforms like Netlify, GitHub Pages, or any static hosting service:

1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your hosting provider

## Project Structure

```
progression-hero/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── stores/        # Zustand state stores
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
├── dist/              # Build output (generated)
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.