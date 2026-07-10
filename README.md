# PT Time Block Timeline

**Your all-in-one productivity, health, and automation desktop application.**

PT Time Block Timeline is a downloadable Electron desktop application that eliminates the need to jump between multiple tools. It combines project management, time blocking, health optimization, and smart automation into a single, beautifully designed workspace.

---

## What's Inside

### Core Productivity
| Module | Description |
|---|---|
| **Dashboard** | At-a-glance view of your day: active projects, tasks due, time blocks, and health progress |
| **Projects** | Kanban-style project management with status tracking, milestones, and AI-powered planning |
| **Tasks** | Full task management with subtasks, priorities, due dates, tags, and filtering |
| **Time Blocking** | Visual daily calendar grid for blocking focused work sessions |
| **Timeline** | Gantt-style project timeline with milestone tracking and deadline visualization |

### Lifestyle & Vision
| Module | Description |
|---|---|
| **Vision Board** | Drag-and-drop canvas for images, text, quotes, and goals with multiple board support |
| **Health Pro** | Daily wellness recommendations, goal tracking (water, steps, sleep, exercise, meditation), and metric logging |

### Automation (No MCP — Zero Token Cost)
| Module | Description |
|---|---|
| **Email Triage** | CLI-based email fetching with AI categorization — never reads emails that don't matter |
| **Newsletter Digest** | RSS feed reader that surfaces key insights without inbox clutter |
| **Viral Post Generator** | AI-powered content creation for Twitter/X, LinkedIn, Instagram, Threads, and Facebook |

---

## AI Integration

PT Time Block Timeline supports **optional** LLM integration. Every module has its own customizable system prompt so the AI behaves exactly how you want it to.

### Supported Models
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Custom**: Any OpenAI-compatible endpoint (Ollama, LM Studio, etc.)

### Per-Category Prompts
Each module has its own AI prompt that you can customize:
- Projects → breakdown, planning, risk analysis
- Tasks → clarification, prioritization, subtask generation
- Time Blocking → optimal scheduling, deep work sequencing
- Timeline → realistic deadlines, buffer time, dependencies
- Health Pro → personalized wellness recommendations
- Email Triage → categorization, action identification
- Newsletters → insight extraction, key takeaways
- Viral Posts → platform-optimized content generation

> **Privacy**: Your API key is stored locally and encrypted. All AI calls go directly to your chosen provider — no proxy, no middleman.

---

## Installation

### Linux (AppImage)
```bash
# Download the AppImage
chmod +x "PT Time Block Timeline-1.0.0.AppImage"
./"PT Time Block Timeline-1.0.0.AppImage"
```

### Build from Source
```bash
# Prerequisites: Node.js 18+, npm

# Install dependencies
npm install

# Development mode
npm run dev

# Build production
npm run build

# Package as AppImage
npx electron-builder --linux AppImage --publish never

# Package as .deb
npx electron-builder --linux deb --publish never

# Package for macOS
npx electron-builder --mac --publish never

# Package for Windows
npx electron-builder --win --publish never
```

---

## Email CLI Setup

The email triage feature uses a lightweight CLI (not MCP) to fetch and process emails:

1. Go to **Settings → Email & RSS**
2. Select your provider (Gmail, Outlook, or IMAP)
3. Enter your email and app-specific password
4. Click **Sync Emails** in the Automation Hub

For Gmail, generate an App Password at: https://myaccount.google.com/apppasswords

---

## RSS Newsletter Setup

1. Go to **Settings → Email & RSS**
2. Add RSS feed URLs (e.g., `https://hbr.org/feed`)
3. Click **Fetch Newsletters** in the Automation Hub

---

## Data & Privacy

- All data is stored **locally** on your device using encrypted electron-store
- No cloud sync, no telemetry, no data collection
- AI API keys are stored locally and never transmitted to any third party
- Email credentials are stored locally and only used for direct IMAP connections

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 41 |
| UI Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Animations | Framer Motion |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Date Handling | date-fns |
| Local Storage | electron-store |
| Build Tool | Vite 8 |
| Packaging | electron-builder |

---

## Philosophy

> Productivity, health, and redundant tasks gone — so you can focus on the big things.

PT Time Block Timeline is designed around one principle: **reduce the number of apps you need to open**. Instead of switching between a project manager, a calendar, a health tracker, a vision board, and an email client, everything lives in one focused, distraction-free workspace.

The AI features are **optional** and **additive** — the app is fully functional without any API key. When you do enable AI, it enhances rather than replaces your thinking.

---

*Built with Electron + React + TypeScript*
