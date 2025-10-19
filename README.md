# 🎤 Tight 5 - AI-Powered Comedy Writing App

An AI-powered web application that helps comedians develop jokes from premises, build their 5-minute standup routines, and track performance with intelligent suggestions and analysis.

## ✨ Features

### 🎭 Joke Workshop

- **AI-Assisted Joke Creation**: Transform premises into complete jokes with AI-generated setups and punchlines
- **Multiple Variations**: Generate multiple options for setups and punchlines
- **Smart Tag Suggestions**: AI recommends tags, toppers, and callbacks
- **Step-by-Step Flow**: Guided process from premise to polished joke

### ✏️ Joke Management

- **Comprehensive Dashboard**: View all jokes with search and filtering
- **Version History**: Track iterations and changes to jokes
- **Performance Tracking**: Record how jokes perform in practice and live shows
- **Status Management**: Track jokes as draft, working, polished, or retired

### 🎯 Routine Builder

- **Visual Routine Construction**: Drag-and-drop interface for building sets
- **AI Flow Analysis**: Get intelligent feedback on routine structure
- **5-Minute Target**: Visual indicators for time management
- **Energy Progression**: See how energy flows through your set
- **Callback Detection**: AI identifies callback opportunities between jokes

### 📊 AI Intelligence

- **Joke Analysis**: AI identifies weaknesses and suggests improvements
- **Routine Optimization**: AI suggests optimal joke ordering
- **Performance Insights**: Pattern detection in what works and what doesn't
- **Smart Placement**: AI recommends where new jokes fit best

### 🛡️ AI Guardrails

- Task-scoped system prompts keep AI focused on comedy writing
- Input validation prevents off-topic requests
- Context-aware responses specific to each feature

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI GPT-5
- **State Management**: React Hooks + Context API
- **Storage**: LocalStorage (client-side)
- **Drag & Drop**: @hello-pangea/dnd

## 📦 Installation

### Quick Start (MVP - LocalStorage)

1. **Clone the repository**

```bash
git clone <repo-url>
cd comedy
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 🚀 Full Setup (Phase 15 - Authentication & Database)

**⚠️ Note:** Phase 15 is 50% complete! Authentication system is built, but requires manual setup.

**To enable multi-user authentication and cloud database:**

1. **Follow the setup guides:**
   - `SETUP_INSTRUCTIONS.md` - Complete walkthrough
   - `SUPABASE_SETUP.md` - Database configuration
   - `README_NEXT_STEPS.md` - Quick overview

2. **What you'll get:**
   - 🔐 Google OAuth authentication
   - ☁️ Cloud database via Supabase
   - 👥 Multi-user support
   - 🔄 Data sync across devices

3. **Setup time:** ~30-40 minutes (one-time)

See `README_NEXT_STEPS.md` for detailed instructions!

## 🏗️ Project Structure

```
comedy/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes for AI
│   │   ├── joke/           # Joke-related AI endpoints
│   │   ├── routine/        # Routine analysis endpoints
│   │   └── performance/    # Performance analysis
│   ├── workshop/           # Joke creation flow
│   ├── routines/           # Routines list
│   ├── layout.tsx          # Root layout with navigation
│   └── page.tsx            # Dashboard/homepage
├── components/
│   ├── ui/                 # Base UI components
│   └── layout/             # Layout components (Header)
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── storage.ts          # LocalStorage service
│   ├── utils.ts            # Utility functions
│   └── ai-prompts.ts       # AI system prompts and guardrails
├── hooks/
│   ├── useJokes.ts         # Joke management hook
│   ├── useRoutines.ts      # Routine management hook
│   ├── useAI.ts            # AI operations hook
│   ├── useLocalStorage.ts  # LocalStorage hook
│   ├── useDebounce.ts      # Debounce hook
│   └── useTimer.ts         # Timer hook for performance mode
└── public/                 # Static assets
```

## 🎨 Key Features Implemented

### ✅ Completed

- **Core Infrastructure**
  - TypeScript type definitions for all data models
  - LocalStorage service with export/import
  - Comprehensive utility functions
  - AI prompt templates with guardrails

- **AI Integration**
  - OpenAI GPT-5 integration
  - 6 API routes for joke and routine analysis
  - Intelligent guardrails to keep AI on-topic
  - Error handling and retry logic

- **Custom Hooks**
  - `useJokes` - Complete joke CRUD with filtering and sorting
  - `useRoutines` - Routine management and calculations
  - `useAI` - All AI operations with loading states
  - `useTimer`, `useDebounce`, `useLocalStorage`

- **UI Components**
  - Custom components: Button, Card, Input, Textarea, Badge
  - Loading indicators (including AI-specific)
  - Responsive navigation header
  - Clean, comedy-themed color scheme

- **Pages**
  - Dashboard with stats, search, and joke grid
  - Joke Workshop with AI-assisted 4-step creation flow
  - Routines list page

### 🚧 To Be Implemented (Future Enhancements)

- Joke Editor with version history
- Full Routine Builder with drag-and-drop
- Smart Placement Assistant modal
- Performance Mode with timer
- Export to PDF/TXT
- Additional filtering and sorting options

## 📝 Usage

### Creating a Joke

1. Click **"Create New Joke"** on the dashboard
2. Enter your premise/observation
3. AI generates 3 setup variations (or write your own)
4. AI generates 5 punchline options (or write your own)
5. Review AI-suggested tags and add details
6. Save your joke

### Managing Jokes

- **Search**: Use the search bar on the dashboard
- **View/Edit**: Click any joke card to view details
- **Filter**: Search jokes by title, setup, or punchline

### Building Routines

- View all routines on the Routines page
- Track total time and flow score

## 🔐 Data Privacy

- All data is stored locally in your browser (LocalStorage)
- No server-side storage or user accounts
- Export your data anytime as JSON
- AI requests are sent to OpenAI but joke data is not stored by OpenAI

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (OPENAI_API_KEY)
4. Deploy

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🎭 For Comedians

This app is designed to help you:

- Organize your material
- Develop jokes systematically
- Build tight sets
- Track what works
- Improve your craft with AI assistance

Remember: AI is a tool to enhance your creativity, not replace it. Your unique voice and perspective are what make comedy great!

---

**Built with ❤️ for the comedy community**

Happy writing! 🎤
