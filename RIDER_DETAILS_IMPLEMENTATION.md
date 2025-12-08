# Rider Details Implementation Guide

## Overview
This document outlines the required changes to display rider/delivery partner details on completed order receipts.

## Database Schema Changes

### 1. Delivery Boy (dboy) Table
Ensure the following fields exist in your `dboy` table:

```sql
-- Required fields for rider details
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) NOT NULL;
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `phone` VARCHAR(20) NOT NULL;
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `email` VARCHAR(255);
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `profile_pic` VARCHAR(255);
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `vehicle_type` VARCHAR(50);
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `vehicle_number` VARCHAR(50);
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `license_number` VARCHAR(50);
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `status` TINYINT(1) DEFAULT 1 COMMENT '1=Active, 0=Inactive';
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `dboy` ADD COLUMN IF NOT EXISTS `total_deliveries` INT DEFAULT 0;
```

### 2. Orders Table
Ensure the orders table includes rider reference:

```sql
-- Add delivery boy reference to orders
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `dboy_id` INT;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `dboy_assign_time` DATETIME;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `dboy_accept_time` DATETIME;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `delivery_start_time` DATETIME;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `delivery_complete_time` DATETIME;

-- Add foreign key constraint
ALTER TABLE `orders` 
ADD CONSTRAINT `fk_orders_dboy` 
FOREIGN KEY (`dboy_id`) REFERENCES `dboy`(`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

## API Response Structure

### Homepage/My Orders API Response
The API endpoint (`dboy/homepage?id={id}&lid={lid}&status=5`) should return rider details in the order object:

```json
{
  "msg": "done",
  "data": [
    {
      "id": "123",
      "store": "Store Name",
      "total": "200.00",
      "currency": "₱",
      "date": "05-Dec-2025 | 11:31:AM",
      "status": "Delivered",
      "st": 5,
      
      // Rider Details (REQUIRED)
      "dboy": "Rider Name",
      "dboy_id": "45",
      "dboy_phone": "09519826577",
      "dboy_email": "rider@example.com",
      
      // Customer Details
      "user": {
        "name": "Customer Name",
        "phone": "09519826577",
        "address": "Complete Address"
      },
      
      // Order Items
      "items": [
        {
          "item": "Product Name",
          "type": "Type",
          "qty": "1",
          "price": "200.00",
          "addon": []
        }
      ],
      
      // Price Breakdown
      "subtotal": "200.00",
      "d_charge": "0.00",
      "tax": "0.00",
      "discount": "0.00",
      "pay": 1,
      "payable": "200.00"
    }
  ]
}
```

## Admin Panel Requirements

### 1. Delivery Staff Management Page

Create/Update admin delivery staff management with these features:

#### A. Staff List View
- Display all delivery riders in a table/grid
- Show: ID, Name, Phone, Email, Status, Total Deliveries, Rating
- Search and filter functionality
- Actions: View, Edit, Activate/Deactivate, Delete

#### B. Add/Edit Staff Form
Required fields:
- **Personal Information**
  - Full Name (required)
  - Phone Number (required, unique)
  - Email (optional)
  - Profile Photo
  - Date of Birth
  - Address

- **Delivery Information**
  - Vehicle Type (Motorcycle, Bicycle, Car, etc.)
  - Vehicle Number
  - License Number
  - License Expiry Date

- **Account Information**
  - Password (required for new staff)
  - Status (Active/Inactive)
  - Location ID (for multi-location setup)

- **Performance Metrics** (read-only)
  - Total Deliveries
  - Average Rating
  - On-time Delivery Rate
  - Last Active Date

#### C. Staff Details View
Display comprehensive rider information:
- Personal details
- Vehicle information
- Delivery statistics
- Recent delivery history
- Customer ratings and reviews
- Earnings summary

### 2. Order Management Updates

When assigning orders to delivery riders, ensure:

1. **Order Assignment**
   - Store `dboy_id` when assigning rider
   - Record `dboy_assign_time` timestamp
   
2. **Order Tracking**
   - Update `dboy_accept_time` when rider accepts
   - Update `delivery_start_time` when rider starts delivery
   - Update `delivery_complete_time` when delivered

3. **Order History**
   - Display rider name and phone in order details
   - Show delivery timeline with timestamps

## Backend API Updates

### Update the `homepage` endpoint in `api/dboy/homepage.php`:

```php
// Include rider details in completed orders
if ($status == 5) {
    $orders = $db->query("
        SELECT 
            o.*,
            d.name as dboy,
            d.id as dboy_id,
            d.phone as dboy_phone,
            d.email as dboy_email
        FROM orders o
        LEFT JOIN dboy d ON o.dboy_id = d.id
        WHERE o.dboy_id = ? AND o.st = 5
        ORDER BY o.id DESC
    ", [$dboy_id]);
}
```

### Update the `userInfo` endpoint in `api/dboy/userInfo.php`:

Include rider details in response for completed orders count:

```php
$response = [
    'data' => $userData,
    'order' => $completedOrdersCount,
    'rider_stats' => [
        'total_deliveries' => $completedOrdersCount,
        'rating' => $riderRating,
        'earnings' => $totalEarnings
    ]
];
```

## Frontend Display

The rider details are now displayed in the completed orders view with:
- Rider name
- Rider phone (clickable for call)
- Rider ID
- Highlighted in a green-themed card for visibility

## Testing Checklist

- [ ] Database tables updated with required fields
- [ ] API returns rider details in order response
- [ ] Admin panel can add/edit delivery staff
- [ ] Orders are assigned to riders correctly
- [ ] Rider details display on completed orders receipt
- [ ] Phone numbers are clickable (tel: links work)
- [ ] Rider information shows for all completed orders
- [ ] Mobile responsive design works properly

## Security Considerations

1. **Data Privacy**
   - Only show rider details to customers who received deliveries from them
   - Don't expose personal rider data (email, full address) to customers
   - Mask phone numbers partially if needed

2. **Access Control**
   - Only admins should access full rider management
   - Riders should only see their own profile and assigned orders
   - Customers should only see their order's assigned rider

3. **Data Validation**
   - Validate phone numbers format
   - Verify license numbers when adding riders
   - Ensure unique phone/email per rider

## Future Enhancements

- Rider performance dashboard
- Customer rating system for riders
- Real-time rider location tracking
- Automated rider assignment based on location
- Rider earnings and payout management
- Push notifications for order assignments
