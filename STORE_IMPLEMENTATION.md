# Store Portal Implementation

This document outlines the implementation of the Store Portal feature in the web_app, which is separate from the user portal.

## Overview

The Store Portal allows store owners to:
- Login with their store credentials (phone + password)
- View and manage orders
- View order statistics
- Confirm or cancel orders
- Manage store profile
- Enable/disable menu items

## Architecture

### Separate Authentication System
- Store authentication is completely separate from user authentication
- Uses different localStorage keys: `store_user_id`, `store_user_data`
- Separate API endpoints under `/api/store/`

### File Structure

```
web_app/
├── app/
│   ├── store/
│   │   ├── login/
│   │   │   └── page.tsx          # Store login page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Store dashboard (orders overview)
│   │   ├── order/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Order detail page
│   │   └── account/
│   │       └── page.tsx          # Store account settings
│   └── page.tsx                  # Landing page (updated with store login button)
├── lib/
│   ├── store-api.ts              # Store API service layer
│   └── store-auth-store.ts      # Store authentication state management
```

## Features Implemented

### 1. Landing Page Updates
- Added "Store Login" button in hero section
- Green button with store icon to distinguish from user login
- Direct link to `/store/login`

### 2. Store Login (`/store/login`)
- Phone-based authentication (matching mobile app)
- Password field with show/hide toggle
- Redirects to `/store/dashboard` on success
- Link back to home page
- Link to customer login for clarity

### 3. Store Dashboard (`/store/dashboard`)
- **Order Overview Cards:**
  - Total Orders
  - Complete Orders
  
- **Tabbed Order Management:**
  - New Orders tab
  - Completed Orders tab
  - Cancelled Orders tab
  
- **Order List Features:**
  - Order ID, customer name, address
  - Order type (Delivery/Pickup)
  - Order status indicators with colors
  - Total amount display
  - Click to view details
  
- **Header Features:**
  - Store name display
  - Refresh button
  - Account button
  - Logout button

### 4. Order Detail Page (`/store/order/[id]`)
- **Order Information:**
  - Order number and timestamp
  - Order items with quantities and prices
  - Add-ons display
  - Customer notes
  
- **Customer Details:**
  - Name
  - Phone (clickable to call)
  - Delivery address
  
- **Payment Details:**
  - Subtotal
  - E-cash usage
  - Total payable
  - Payment method
  
- **Actions (for new orders):**
  - Confirm Order button
  - Cancel Order button
  - Assign Delivery Boy (if applicable)

### 5. Store Account Page (`/store/account`)
- **Profile Tab:**
  - Edit store name
  - Edit email
  - Edit phone number
  - Edit address
  - Save changes
  
- **Items Tab:**
  - View all store items
  - Enable/disable items
  - Item images and prices

## API Integration

### Store API Endpoints
All endpoints use the base URL: `https://bsitport2026.com/servex/api/store/`

- `POST /login` - Store authentication
- `GET /homepage` - Get orders and overview
- `GET /orderProcess` - Update order status
- `GET /getItem` - Get store items
- `POST /changeStatus` - Enable/disable items
- `POST /updateInfo` - Update store profile
- And more...

## State Management

### Store Auth Store (Zustand)
```typescript
interface StoreAuthState {
  storeId: string | null;
  storeData: any | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => boolean;
  getStoreData: () => any;
}
```

## Styling

- Uses Tailwind CSS for all styling
- Green color scheme for store portal (vs pink for user portal)
- Responsive design for mobile and desktop
- Icons from `lucide-react`
- Toast notifications with `react-hot-toast`

## Security

- Authentication checks on all protected routes
- Redirects to login if not authenticated
- Separate localStorage keys prevent conflicts with user auth
- Token-based API authentication (if implemented in backend)

## Mobile App Compatibility

The implementation closely follows the mobile app structure:
- Same API endpoints
- Same data structures
- Same order status flow
- Same terminology and UI patterns

## Future Enhancements

Potential features to add:
1. Delivery boy assignment page
2. Real-time order notifications
3. Sales analytics and reports
4. Item management (add/edit/delete)
5. Store hours management
6. Delivery radius settings
7. Promo code management
8. Customer reviews management

## Testing

To test the store portal:
1. Navigate to the landing page
2. Click "Store Login" button
3. Enter store credentials (phone + password)
4. Explore dashboard, orders, and account settings

## Notes

- Store login is completely separate from user login
- Both portals can be used simultaneously in different browser tabs
- All store pages require authentication
- Order data syncs with mobile app in real-time (via API)
