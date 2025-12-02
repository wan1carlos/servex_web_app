# Store Portal Quick Reference

## 🚀 Getting Started

### Access the Store Portal
1. Navigate to the landing page: `http://localhost:3000`
2. Click the green "Store Login" button
3. Enter store credentials:
   - Phone number (as registered in the database)
   - Password

### Development Server
```bash
cd web_app
npm run dev
# Open http://localhost:3000
```

## 📍 Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with Store Login button |
| `/store/login` | Store authentication |
| `/store/dashboard` | Main dashboard with orders |
| `/store/order/[id]` | Order detail and management |
| `/store/account` | Store profile and item management |

## 🔑 Authentication

### Login Flow
```typescript
import { useStoreAuth } from '@/lib/store-auth-store';

const { login } = useStoreAuth();
const result = await login(phone, password);

if (result.success) {
  // Redirect to /store/dashboard
}
```

### Check Authentication
```typescript
const { checkAuth } = useStoreAuth();
if (!checkAuth()) {
  router.replace('/store/login');
}
```

### Logout
```typescript
const { logout } = useStoreAuth();
logout(); // Clears localStorage and state
```

## 📡 API Usage

### Import API
```typescript
import { servexStoreApi } from '@/lib/store-api';
```

### Common Operations

#### Get Dashboard Data
```typescript
const storeId = localStorage.getItem('store_user_id');
const response = await servexStoreApi.homepage(storeId, 0);
// response.data = new orders
// response.complete = completed orders
// response.cancel = cancelled orders
// response.overview = { total, complete }
```

#### Process Order (Confirm/Cancel)
```typescript
// Confirm order (status 1)
await servexStoreApi.orderProcess(orderId, 1);

// Cancel order (status 2)
await servexStoreApi.orderProcess(orderId, 2);
```

#### Update Store Profile
```typescript
await servexStoreApi.updateInfo({
  name: 'Store Name',
  email: 'store@example.com',
  phone: '1234567890',
  address: 'Store Address'
});
```

#### Manage Items
```typescript
// Get all items
const storeId = localStorage.getItem('store_user_id');
const response = await servexStoreApi.getItem(storeId);

// Enable/disable item
await servexStoreApi.changeStatus(itemId, 1); // 1=enabled, 0=disabled
```

#### Get Delivery Boys
```typescript
const response = await servexStoreApi.getDboy(orderId);
// Returns list of available delivery boys
```

## 💾 LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `store_user_id` | Store's unique identifier |
| `store_user_data` | Store profile information (JSON) |
| `store_data` | Additional store data |
| `odata` | Current order being viewed (JSON) |
| `app_text` | Language/text translations |
| `lid` | Language ID |

## 🎨 UI Components & Icons

### Icons (from lucide-react)
- `Store` - Store icon
- `ShoppingBag` - Orders icon
- `CheckCircle` - Confirm/complete icon
- `XCircle` - Cancel icon
- `Truck` - Delivery icon
- `Package` - Items/products icon
- `User` - User/profile icon
- `Phone` - Phone icon
- `Mail` - Email icon
- `MapPin` - Location icon

### Color Scheme
- **Primary**: Green (`bg-green-600`, `text-green-600`)
- **Success**: Green (`bg-green-500`)
- **Danger**: Red (`bg-red-600`)
- **Warning**: Orange/Yellow
- **Info**: Blue (`bg-blue-600`)

### Toast Notifications
```typescript
import toast from 'react-hot-toast';

toast.success('Order confirmed!');
toast.error('Failed to update');
toast('Processing...');
```

## 📊 Order Status Codes

| Status | Meaning | Color |
|--------|---------|-------|
| 0 | New Order | Orange |
| 1 | Confirmed | Green |
| 2 | Cancelled | Red |
| 3 | Delivery Assigned | Blue |
| 4 | On the Way | Purple |
| 5 | Completed | Green |

## 🔄 Order Types

| Type (otp) | Meaning |
|------------|---------|
| 1 | Delivery |
| 0 or other | Pickup |

## 📱 Mobile App Compatibility

The web app uses the **exact same API endpoints** as the mobile store app:
- Same base URL: `https://bsitport2026.com/servex/api/store/`
- Same request parameters
- Same response structures
- Same authentication flow

## 🛠️ Development Tips

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://bsitport2026.com/servex/api/
```

### TypeScript Types
The API methods are fully typed. Your IDE will provide autocomplete and type checking.

### Error Handling
All API calls include try-catch blocks. Use toast notifications for user feedback:
```typescript
try {
  await servexStoreApi.orderProcess(id, status);
  toast.success('Order updated!');
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to update order');
}
```

### State Management
The app uses Zustand for state management:
- Simple API
- No boilerplate
- React hooks integration
- Persistent storage

## 🧪 Testing

### Test Store Login
1. Use credentials from your database
2. Phone should match format expected by API
3. Password should be correctly hashed on backend

### Test Order Management
1. Create test order via user app
2. Login to store portal
3. View order in dashboard
4. Click order to see details
5. Confirm or cancel order
6. Verify status updates in real-time

### Test Item Management
1. Go to Account > Items tab
2. Toggle item status
3. Verify changes persist
4. Check if disabled items don't appear in user app

## 📚 Additional Resources

- **Store Implementation Guide**: `STORE_IMPLEMENTATION.md`
- **API Verification**: `STORE_API_VERIFICATION.md`
- **User Implementation**: `user/` folder for reference
- **Mobile App**: `store/` folder for mobile implementation

## 🆘 Troubleshooting

### Login Issues
- Verify API base URL is correct
- Check network tab for API response
- Verify credentials in database
- Check CORS settings if API is different domain

### Orders Not Loading
- Verify `store_user_id` in localStorage
- Check API response in network tab
- Ensure `lid` (language ID) is set if required

### API Errors
- Check backend logs
- Verify endpoint is accessible
- Check request parameters match expected format
- Verify authentication token/session

### TypeScript Errors
- Run `npm install` to ensure all dependencies
- Check `tsconfig.json` configuration
- Restart VS Code/IDE after installing packages

## 🎯 Best Practices

1. **Always check authentication** before accessing protected routes
2. **Use loading states** for better UX during API calls
3. **Handle errors gracefully** with user-friendly messages
4. **Keep localStorage in sync** with component state
5. **Use TypeScript types** for type safety
6. **Follow existing patterns** from user implementation
7. **Test on multiple screen sizes** for responsiveness

---

**Need Help?** Check the implementation files or mobile app code for reference.
