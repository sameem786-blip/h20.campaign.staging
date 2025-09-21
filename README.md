# Creator Dossier Hub

A dynamic, interactive interface for evaluating creators with progressive disclosure functionality. Built with React, TypeScript, and Framer Motion.

## 🎯 Features

### Progressive Disclosure Pattern
- **Clean Summary View**: Key metrics (Views, Rate, CPM) always visible
- **Expandable Sections**: 4 detailed sections that expand on demand
- **Smooth Animations**: Framer Motion powered transitions

### Three-Tier Architecture
1. **Progress Indicator** (top): Shows current position "Card 5 of 265"
2. **Creator Dossier Card** (center): Main interactive expandable card
3. **Decision Hub** (bottom): Fixed action buttons with real-time counters

### Interactive Elements
- ✅ Expandable stats, rates, conversation history, and interaction sections
- ✅ Chat-like conversation display
- ✅ Creator interaction form with message input
- ✅ Pass/Maybe/Favorite decisions with counters
- ✅ Responsive design for mobile and desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components (Button, Card, etc.)
│   ├── CreatorDossierCard.tsx # Main expandable card component
│   ├── DecisionHub.tsx        # Bottom action buttons
│   └── ProgressIndicator.tsx  # Top progress bar
├── data/
│   └── sampleData.ts          # Sample creator data
├── types/
│   └── creator.ts             # TypeScript interfaces
└── App.tsx                    # Main application component
```

## 🎨 Design System

The UI follows the progressive disclosure pattern with:

- **Clean collapsed state** showing essential information
- **Smooth expand/collapse** animations for detailed sections
- **Fixed decision interface** always accessible at bottom
- **Consistent styling** with Tailwind CSS
- **Responsive layout** adapting to different screen sizes

## 📊 Sample Data

The prototype uses sample data matching the specification:

- Creator handle: @athienor6
- Key metrics: Views, Rate, CPM rankings
- Rate packages: YouTube Integration & CPM deals
- Conversation history: 2 messages between team and creator
- Interactive messaging capability

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Lucide React** - Icon library

## 🎭 Interactive Demo

1. **View Creator Summary**: See key metrics at a glance
2. **Expand Sections**: Click to reveal detailed information
3. **Review Conversations**: Chat-like message history
4. **Make Decisions**: Use Pass/Maybe/Favorite buttons
5. **Send Messages**: Interact directly with creators

## 📱 Responsive Design

Optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

The interface adapts seamlessly across all screen sizes while maintaining the core user experience.

---

Built with ❤️ using 21st.dev components and modern React patterns.