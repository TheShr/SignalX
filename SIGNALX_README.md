# SignalX - AI Decision Engine Frontend

A premium, Apple-inspired real-time decision intelligence platform built with Next.js 16, Framer Motion, GSAP, and Tailwind CSS.

## Overview

SignalX is a sophisticated SaaS dashboard featuring:

- **Premium Dark Theme** - Glassmorphism design with cyan/purple gradient accents
- **Real-Time Data Streams** - Live feed of market signals and business events
- **AI-Powered Insights** - Expandable insight cards with confidence scores
- **Intelligent Alerts** - Priority-based alert system with auto-dismiss
- **Interactive Charts** - Trend visualization and activity tracking
- **Smooth Animations** - 60fps Framer Motion and GSAP animations throughout
- **Responsive Design** - Mobile-first approach, fully responsive across devices

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Styling**: Tailwind CSS 4.2.0
- **Animations**: Framer Motion 12.38.0 + GSAP 3.15.0
- **UI Components**: shadcn/ui + custom components
- **Charts**: Recharts 2.15.0
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page with hero section
│   ├── layout.tsx                  # Root layout with dark theme
│   ├── globals.css                 # Theme tokens and animations
│   └── dashboard/
│       ├── page.tsx                # Main dashboard
│       └── layout.tsx              # Dashboard metadata
│
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              # Sticky header with blur effect
│   │   ├── sidebar.tsx             # Collapsible navigation
│   │   └── dashboard-layout.tsx    # Dashboard wrapper
│   ├── dashboard/
│   │   ├── real-time-feed.tsx      # Live signal feed
│   │   ├── ai-insights-panel.tsx   # Expandable insight cards
│   │   ├── alerts-panel.tsx        # Priority-based alerts
│   │   ├── charts-section.tsx      # Recharts visualizations
│   │   └── skeleton-loader.tsx     # Loading states
│   ├── animations/
│   │   ├── gradient-background.tsx # Animated gradient blobs
│   │   └── floating-particles.tsx  # Canvas particle effect
│   └── notifications/
│       └── toast.tsx               # Toast notifications
│
├── lib/
│   ├── animations.ts               # Shared Framer Motion variants
│   ├── mock-data.ts                # Mock data generators
│   └── utils.ts                    # Utility functions
│
└── hooks/
    └── use-real-time-updates.ts    # Real-time data simulation hook
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
pnpm build
pnpm start
```

## Key Features

### Landing Page (`/`)

- Animated hero section with floating particles
- Feature showcase with staggered animations
- Call-to-action buttons with hover effects
- Responsive design for all screen sizes

### Dashboard (`/dashboard`)

**Real-Time Feed**
- Auto-updating mock data stream
- Impact-based color coding (HIGH/MEDIUM/LOW)
- Smooth card entrance animations
- Timestamp display with relative time

**AI Insights**
- Expandable insight cards with animated height transitions
- Confidence score visualization with animated progress bars
- Explanation and suggested action details
- Micro-interactions on hover

**Alerts**
- Priority-based styling (CRITICAL/WARNING/INFO)
- Real-time alert addition with toast notifications
- Dismissible alert items with smooth exit animation
- Critical alert pulse animation

**Charts**
- Area chart showing decision volume trends
- Bar chart displaying system activity by hour
- Interactive tooltips with custom styling
- Responsive container for various screen sizes

## Animation System

### Framer Motion Variants

The project uses reusable animation variants defined in `lib/animations.ts`:

```typescript
// Staggered container animations
containerVariants
itemVariants
cardVariants

// Directional animations
slideInFromLeftVariants
slideInFromRightVariants
slideInFromTopVariants

// Special effects
pulseVariants
fadeInVariants
```

### Custom CSS Animations

Additional animations defined in `globals.css`:

- `animate-float` - Floating blob effect
- `animate-pulse-glow` - Glowing pulse
- `animate-shimmer` - Skeleton loading shimmer
- `animate-slide-in-*` - Directional slide animations
- `animate-scale-in` - Zoom entrance
- `gradient-shift` - Moving gradient background

### Glassmorphism Effects

Utility classes for premium glass aesthetic:

```html
<!-- Full glassmorphism -->
<div class="glass">...</div>

<!-- Subtle glass effect -->
<div class="glass-sm">...</div>

<!-- Glow effects -->
<div class="glow-cyan">...</div>
<div class="glow-purple">...</div>
<div class="glow-pink">...</div>
```

## Theme System

### Color Palette

- **Background**: `#0a0e27` (Premium dark)
- **Card**: `#0f1330` (Subtle blue tint)
- **Primary**: `#00d4ff` (Bright cyan)
- **Accent**: `#8b5cf6` (Vivid purple)
- **Secondary**: `#a78bfa` (Light violet)
- **Destructive**: `#ef4444` (Warning red)

### CSS Custom Properties

All colors and spacing are defined as CSS variables in `:root` and `.dark` selectors, enabling easy theme switching:

```css
--background: #0a0e27;
--foreground: #e6e6fa;
--primary: #00d4ff;
--accent: #8b5cf6;
```

## Real-Time Data Simulation

The `useRealTimeUpdates` hook simulates real-time data streams:

```typescript
const { feedItems, alerts, addFeedItem, removeAlert } = useRealTimeUpdates({
  feedInterval: 6000,      // New feed item every 6 seconds
  alertInterval: 10000,    // New alert every 10 seconds
  enabled: true,           // Toggle simulation on/off
})
```

Mock data is generated with realistic patterns:

- Random impact levels and sources
- Varied alert priorities
- Time-based data generation
- Confidence scores for insights

## Performance Optimizations

1. **GPU Acceleration**: All animations use transform and opacity for 60fps performance
2. **Lazy Loading**: Components load on viewport visibility
3. **Code Splitting**: Next.js automatic code splitting via App Router
4. **Image Optimization**: Next.js Image component where applicable
5. **CSS Optimizations**: Tailwind's PurgeCSS removes unused styles
6. **Responsive Images**: Mobile-first design with responsive utilities

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Android latest

## Customization

### Changing Colors

Update CSS variables in `app/globals.css`:

```css
:root {
  --primary: #your-color;
  --accent: #your-color;
  /* ... etc */
}
```

### Adjusting Animation Timings

Modify values in `lib/animations.ts`:

```typescript
export const DURATION_FAST = 0.2    // Increase for slower animations
export const DURATION_NORMAL = 0.4
export const DURATION_SLOW = 0.6
```

### Changing Data Update Intervals

Configure in your component:

```typescript
const { feedItems } = useRealTimeUpdates({
  feedInterval: 8000,   // Change frequency
  alertInterval: 15000,
})
```

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub repo
git push origin main

# Deploy on Vercel dashboard
# Auto-detected as Next.js project
```

### Other Platforms

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

The app is fully self-contained and requires no backend API calls (all data is mocked client-side).

## Development Tips

### Adding New Dashboard Panels

1. Create component in `components/dashboard/`
2. Use Framer Motion variants from `lib/animations.ts`
3. Apply glassmorphism with `glass` class
4. Add to dashboard grid in `app/dashboard/page.tsx`

### Creating Custom Animations

1. Define variants in component or `lib/animations.ts`
2. Use Motion components from `framer-motion`
3. Add CSS animations to `globals.css` if needed
4. Test on different devices for performance

### Modifying Mock Data

1. Edit data definitions in `lib/mock-data.ts`
2. Adjust generation functions as needed
3. Update component props to accept real data
4. Connect to actual API when ready

## Future Enhancements

- WebSocket integration for real backend data
- User authentication system
- Persistent settings per user
- Custom dashboard layouts
- Advanced filtering and search
- Export reports functionality
- Dark/light theme toggle
- Notification preferences
- Mobile app version

## License

This project is created with v0.app

## Support

For issues or questions about the implementation, refer to:
- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://gsap.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
