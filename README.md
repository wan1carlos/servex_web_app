# ServEx - On-Demand Services & Delivery Web App

A modern, fully-functional Next.js web application for on-demand services and delivery. Built with TypeScript, Tailwind CSS, and Zustand for state management.

## 🚀 Features

### Core Functionality
- ✅ **Beautiful Landing Page** - Modern hero section with features and CTAs
- ✅ **User Authentication** - Login, Signup with JWT token management
- ✅ **Homepage** - Browse stores, categories, and trending items
- ✅ **Store Pages** - View items, filter by category, add to cart
- ✅ **Shopping Cart** - Full cart management with quantity controls
- ✅ **User Account** - Profile management, wallet balance
- ✅ **Order Management** - View order history and status
- ✅ **Multi-language Support** - Language and city selection
- ✅ **Location Services** - Geolocation integration
- ✅ **Search & Filters** - Real-time search across stores and items
- ✅ **Responsive Design** - Mobile-first, works on all devices

### Pages Implemented
1. **/** - Landing page with hero, features, stats
2. **/home** - Main store browsing page
3. **/login** - User login
4. **/signup** - User registration
5. **/cart** - Shopping cart
6. **/store/[id]** - Store detail with items
7. **/account** - User profile and settings
8. **/orders** - Order history
9. **/about** - About ServEx
10. **/contact** - Contact form

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Maps**: Leaflet (optional)

## 📦 Installation

```bash
# Navigate to the web app directory
cd web_app

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with:
NEXT_PUBLIC_API_BASE_URL=https://bsitport2026.com/servex/api/

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
web_app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Header/Footer
│   ├── page.tsx           # Landing page
│   ├── home/              # Homepage
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── cart/              # Shopping cart
│   ├── store/[id]/        # Dynamic store pages
│   ├── account/           # User account
│   ├── orders/            # Order history
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Site footer
├── lib/                   # Core utilities
│   ├── types.ts          # TypeScript interfaces
│   ├── api.ts            # API service layer
│   ├── auth-store.ts     # Authentication state
│   ├── cart-store.ts     # Cart state management
│   └── app-store.ts      # App settings state
└── public/               # Static assets
```

## 🔑 Key Features Explained

### State Management (Zustand)
The app uses three main stores:

1. **auth-store.ts** - User authentication
   - Login/Signup/Logout
   - User session persistence
   - JWT token management

2. **cart-store.ts** - Shopping cart
   - Add/Remove items
   - Update quantities
   - Cart persistence across sessions

3. **app-store.ts** - App settings
   - Language preferences
   - Location data
   - App configuration

### API Integration
All API calls are centralized in `lib/api.ts` with methods for:
- Authentication (login, signup, forgot password)
- Homepage data (stores, categories, banners)
- Store items and details
- Cart operations
- Order management
- User profile updates

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Gray Scale**: From #F9FAFB to #111827

## 🚧 TODO / Future Enhancements

- [ ] Checkout page with payment integration
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Favorite stores
- [ ] Advanced search filters
- [ ] Order rating and reviews
- [ ] Wallet top-up
- [ ] Address management
- [ ] Coupon/Promo codes UI
- [ ] Dark mode

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://bsitport2026.com/servex/api/
```

---

**Built with ❤️ using Next.js and TypeScript**

