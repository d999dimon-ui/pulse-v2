# TaskHub v2.0 - Complete Restoration Guide

**Premium marketplace platform for services & deliveries with Web3, real-time tracking, and referral system.**

---

## 🎯 What's Been Restored

This is a complete rebuild of TaskHub according to specifications:

### ✅ **Core Features**
- **Hybrid Service Marketplace**: IT services, Couriers, Household services, Marketing, Delivery, Cleaning, Photo, Translation, Tutoring, Repair
- **Task Creation & Discovery**: Grid-based categories, live feed, interactive map
- **Free Market Model**: Executors bid on tasks, customers select the best
- **Live Tracking**: Real-time executor position on the map
- **Web3 Integration**: TON blockchain payments via WalletConnect
- **5-Star Rating System**: Verified reviews and reputation badges
- **Referral Program**: Yandex.Taxi style (Friend completes 5 tasks → Referrer gets 24h VIP)

### ✅ **Design System**
- **Premium Minimalist Dark**: Deep navy/graphite backgrounds
- **Glassmorphism**: Frosted glass effect with blur
- **Neon Accents**: Cyan (#00d9ff), Gold (#ffd700), Purple (#d946ef), Pink (#ff006e)
- **Mobile First**: Telegram Mini App optimized interface
- **Responsive**: Perfect on small screens

### ✅ **Tech Stack**
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Blockchain**: TON via Web3/WalletConnect
- **Maps**: React Leaflet (OpenStreetMap)
- **Real-time**: Supabase Realtime subscriptions

---

## 📋 File Structure

```
├── app/
│   ├── home-content.tsx          ← Main app logic (categories + tabs)
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css               ← Premium Dark theme
├── components/
│   ├── TaskFeed.tsx             ← Task list with filters
│   ├── LiveTaskMap.tsx          ← Interactive map
│   ├── CreateTaskModal.tsx      ← Task creation form
│   ├── UserProfile.tsx          ← Profile + ratings + referrals
│   └── TabBar.tsx               ← Bottom navigation
├── lib/
│   ├── supabase.ts              ← Database client
│   ├── web3-payments.ts         ← TON payments
│   ├── reviews.ts               ← Rating system
│   ├── referral-program-v2.ts   ← Referral logic
│   └── i18n.ts
├── types/
│   └── task.ts                  ← All TypeScript types
├── tailwind.config.ts           ← Design tokens
└── taskhub-schema.sql           ← Complete Supabase schema
```

---

## 🚀 Setup Instructions

### 1. **Database Setup (Supabase)**

```bash
# Run in Supabase SQL Editor (taskhub-schema.sql)
# This creates:
# - profiles (user data + ratings)
# - tasks (core tasks table)
# - task_candidates (executor bids)
# - reviews (5-star system)
# - payments (Web3 transactions)
# - referrals (referral program)
# - locations (live tracking)
# - chat_messages (in-task communication)
# - favorites (saved tasks)
# + indexes, triggers, RLS policies
```

**Key Tables:**
- `profiles`: User data, balance, rating, VIP status
- `tasks`: Jobs/orders with coordinates, priority, categories
- `reviews`: 5-star ratings + verified comments
- `payments`: Transaction history (TON/USD)
- `referrals`: Referral tracking with bonus triggers
- `locations`: Executor GPS tracking

### 2. **Environment Variables**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_id
```

### 3. **Install Dependencies**

```bash
npm install
# or
yarn install
```

### 4. **Start Development**

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🎨 Design System

### Colors
```css
--dark-bg: #0a0e27        /* Deep navy-black */
--dark-card: #1a1f3a      /* Card background */
--dark-border: #2a3050    /* Subtle border */
--neon-cyan: #00d9ff      /* Primary accent */
--neon-gold: #ffd700      /* Reward color */
--neon-purple: #d946ef    /* Secondary accent */
--neon-pink: #ff006e      /* Alert/urgent */
```

### Components
```tailwind
.glass              /* Glassmorphism effect */
.glass-sm           /* Smaller blur */
.glass-dark         /* Darker variant */
.neon-border        /* Glowing neon border */
.btn-primary        /* Main button */
.btn-secondary      /* Secondary button */
.card-glass         /* Content card */
.card-premium       /* Premium card variant */
```

### Animations
```css
@keyframes pulse-neon      /* Glowing neon pulse */
@keyframes float           /* Float animation */
@keyframes shimmer         /* Shimmer effect */
@keyframes slide-up        /* Slide up entrance */
```

---

## 📱 Main Screens

### **Home Tab** (Default)
- User balance card (TON)
- Rating badge (stars)
- Category grid (10 categories)
- Recent tasks list
- Create New Task button

### **Feed Tab**
- Filterable task list
- Search by title/description
- Sort by: Distance, Reward, Newest
- Category filtering
- Claim button on each task

### **Map Tab**
- Live map with all open tasks
- User position (blue marker)
- Task markers (color-coded by category)
- Flash task animation (red with ⚡)
- Click task to view details

### **Chats Tab** (Placeholder)
- Task-specific messaging
- Support chat integration
- Coming soon UI

### **Profile Tab**
- User avatar + stats
- Rating & verified badge
- Balance & wallet
- Completed tasks count
- Reviews & ratings
- Referral code
- Share referral link

---

## 🔄 Core Workflows

### **Create Task**
1. User clicks "Create New Task"
2. Modal opens with form
3. Select category, enter title/description
4. Set reward (TON/USD)
5. Set priority (Normal/Urgent/ASAP)
6. Optional: Add street address
7. Submit → Task appears on map & feed

### **Claim Task (Executor)**
1. Find task in feed or map
2. Click "Claim" button
3. Confirm bidding
4. Wait for customer approval
5. Task status → "claimed"

### **Complete Task**
1. Executor and customer agree on completion
2. Both submit completion confirmation
3. Web3 escrow releases payment
4. Both can leave 5-star reviews

### **Referral Bonus**
1. Referrer shares unique code/link
2. Friend joins via code
3. Friend completes 5 tasks
4. Auto-trigger: Referrer gets 24h Gold VIP
5. VIP benefits: Reduced fees, priority matching, badge

### **Rating System**
1. Task completed
2. Both users can leave review (1-5 stars)
3. Title + comment (optional)
4. User rating auto-calculated
5. Average shown in profile

---

## 💳 Web3 Payment Flow

1. **Task Created**: Customer creates task with TON reward
2. **Escrow Created**: Payment locked in smart contract
3. **Task Claimed**: Executor selected, escrow active
4. **Completion**: Both confirm → Release payment
5. **Transaction**: TON transferred to executor wallet
6. **Fee**: 5% platform fee deducted automatically

**Payment Conversion**
```
TON → USD: 1 TON ≈ $2.50 (approximate)
Platform Fee: 5%
Tax Estimate: 10%
Executor Payout = Reward - (Fee + Tax)
```

---

## 🎯 Key Components Usage

### **CreateTaskModal**
```tsx
<CreateTaskModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  userPosition={[lat, lng]}
  onCreateTask={async (taskData) => {
    await createTask(taskData);
  }}
/>
```

### **TaskFeed**
```tsx
<TaskFeed
  isOpen={true}
  tasks={tasks}
  userLatitude={userPos[0]}
  userLongitude={userPos[1]}
  onClaimTask={async (taskId) => {
    await claimTask(taskId);
  }}
/>
```

### **LiveTaskMap**
```tsx
<LiveTaskMap
  userPosition={[lat, lng]}
  tasks={tasks}
  selectedCategory="it"
  onTaskClick={(task) => {
    // Handle task selection
  }}
/>
```

### **UserProfile**
```tsx
<UserProfile
  user={userProfile}
  reviews={userReviews}
  onClose={() => setShowProfile(false)}
  onWithdraw={async () => {
    // Withdraw funds
  }}
/>
```

---

## 🔧 Important Functions

### **Web3 Payments** (`lib/web3-payments.ts`)
```typescript
createEscrowPayment(taskId, fromId, toId, amount, 'ton')
processPaymentWeb3(paymentId, txHash, contractAddress)
getPaymentHistory(userId)
calculateExecutorPayout(taskReward)
```

### **Reviews** (`lib/reviews.ts`)
```typescript
createReview(taskId, reviewerId, revieweeId, rating, title, comment)
calculateUserRating(userId)
getRatingDistribution(userId)
getReviewAnalytics(userId)
```

### **Referrals** (`lib/referral-program-v2.ts`)
```typescript
createReferralLink(referrerId)
registerReferredUser(referralCode, newUserId)
trackReferralTaskCompletion(referralId)
activateVIPPromo(referrerId)  // 24h Gold VIP
getReferralStats(userId)
```

---

## ⚙️ Configuration

### **Category Definitions** (`types/task.ts`)
```typescript
export type TaskCategory = 
  | 'it' | 'couriers' | 'household_services' 
  | 'marketing' | 'delivery' | 'cleaning' 
  | 'photo' | 'translation' | 'tutoring' | 'repair';
```

### **Task Status Flow**
```
open → claimed → in_progress → completed
   ↘    ↙
    cancelled / expired
```

### **Currency Support**
- TON (primary, Web3)
- USD (traditional fallback)
- STARS (internal reward currency)

---

## 📊 Database Relationships

```
profiles (users)
  ├── tasks (as customer_id, executor_id)
  ├── reviews (as reviewer_id, reviewee_id)
  ├── payments (as from_user_id, to_user_id)
  ├── referrals (as referrer_id)
  └── locations (for tracking)

tasks
  ├── task_candidates (executor bids)
  ├── reviews (for both customer & executor)
  ├── payments (escrow)
  ├── chat_messages
  └── locations (real-time position)
```

---

## 🔐 Security Features

1. **Row Level Security (RLS)**: All tables protected
2. **Task Visibility**: Only open/public tasks visible
3. **User Verification**: is_verified badge
4. **Moderation**: Ability to hide inappropriate reviews
5. **Escrow Protection**: Funds locked until completion
6. **Ban System**: Can disable bad actors

---

## 🚀 Next Steps

### Immediate:
1. ✅ Run SQL schema in Supabase
2. ✅ Set environment variables
3. ✅ Start dev server
4. ✅ Test task creation & claiming

### Short-term:
1. Connect real Telegram Mini App
2. Integrate actual Web3/TON wallet
3. Set up admin dashboard
4. Implement chat messaging
5. Add push notifications

### Long-term:
1. Mobile app (React Native)
2. Advanced analytics
3. Machine learning matching (best executor)
4. Governance tokens
5. DAO features

---

## 📞 Support

**Project Files:**
- [SQL Schema](taskhub-schema.sql)
- [Type Definitions](types/task.ts)
- [Components](components/)
- [Libraries](lib/)

**Key APIs:**
- Supabase: Real-time database
- Leaflet: Maps rendering
- Tailwind: Styling

---

## 🎓 Architecture Summary

```
┌─────────────────┐
│  Telegram Mini  │
│      App        │
└────────┬────────┘
         │
┌────────▼────────┐
│   Next.js 14    │ (SSR + Client)
│   React + TS    │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    │           │          │          │
┌───▼──┐  ┌────▼───┐ ┌───▼──┐ ┌────▼───┐
│Tasks │  │ Reviews│ │Ref.  │ │Payments│
│API   │  │ API    │ │API   │ │API     │
└───┬──┘  └────┬───┘ └───┬──┘ └────┬───┘
    │          │         │         │
    └──────────┴─────────┴─────────┘
             │
        ┌────▼──────────┐
        │   Supabase    │
        │  PostgreSQL   │
        │  + Realtime   │
        └───────────────┘
             │
      ┌──────┴──────┐
      │              │
  ┌───▼────┐  ┌─────▼──┐
  │  Maps  │  │  Web3  │
  │Leaflet │  │  TON   │
  └────────┘  └────────┘
```

---

**Built with ❤️ for the TaskHub community**

*Last Updated: April 7, 2026*
