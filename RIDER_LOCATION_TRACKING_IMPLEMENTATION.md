# Real-Time Rider Location Tracking Implementation Guide

## Overview
This document provides step-by-step instructions for implementing real-time GPS tracking of delivery riders in the Servex backend system.

---

## 1. Database Changes

### Option A: Update Existing `dboy` Table (Recommended)
Add these columns to the `dboy` table:

```sql
ALTER TABLE `dboy` 
ADD COLUMN `current_lat` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Current GPS latitude during delivery',
ADD COLUMN `current_lng` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Current GPS longitude during delivery',
ADD COLUMN `location_updated_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Last GPS update timestamp';
```

### Option B: Create New Tracking Table (Alternative)
If you prefer to keep tracking data separate:

```sql
CREATE TABLE `dboy_live_location` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `dboy_id` INT(11) NOT NULL,
  `lat` VARCHAR(255) NOT NULL,
  `lng` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dboy_id` (`dboy_id`),
  FOREIGN KEY (`dboy_id`) REFERENCES `dboy`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 2. Backend API Endpoints

### 2.1 Update Rider Location (For Delivery App)

**Endpoint:** `POST /api/updateRiderLocation`

**Purpose:** Delivery rider app calls this every 5-10 seconds while on active delivery

**Request Body:**
```json
{
  "dboy_id": "123",
  "lat": "14.937004",
  "lng": "120.887896",
  "order_id": "456"  // Optional: current order being delivered
}
```

**PHP Implementation Example:**
```php
<?php
// File: api/updateRiderLocation.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

$dboy_id = isset($data['dboy_id']) ? $data['dboy_id'] : '';
$lat = isset($data['lat']) ? $data['lat'] : '';
$lng = isset($data['lng']) ? $data['lng'] : '';

// Validate required fields
if (empty($dboy_id) || empty($lat) || empty($lng)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields'
    ]);
    exit;
}

// Update rider location
$sql = "UPDATE dboy 
        SET current_lat = ?, 
            current_lng = ?, 
            location_updated_at = NOW() 
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $lat, $lng, $dboy_id);

if ($stmt->execute()) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Location updated successfully'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update location'
    ]);
}

$stmt->close();
$conn->close();
?>
```

---

### 2.2 Modify Existing `orderDetail` API

**File:** `api/orderDetail.php` (or wherever your order detail endpoint is)

**Changes Needed:**

Add rider's current location to the response when order status is 3 or 4 (rider assigned/on the way).

**Modified SQL Query:**
```php
<?php
// In your existing orderDetail.php file

// Original query - modify to include rider's current location
$sql = "SELECT 
    o.*,
    d.name as dboy,
    d.phone as dboy_phone,
    d.profile_image as dboy_image,
    d.vehicle_type,
    d.vehicle_number,
    d.license_number,
    d.current_lat as rider_current_lat,  -- ADD THIS
    d.current_lng as rider_current_lng,  -- ADD THIS
    d.location_updated_at as rider_location_updated  -- ADD THIS
FROM orders o
LEFT JOIN dboy d ON o.dboy_id = d.id
WHERE o.id = ?";

// Rest of your existing code...

// In the response, make sure to include:
$response = [
    'status' => 'success',
    'data' => [
        // ... existing fields ...
        'lat' => $order['rider_current_lat'],  // Rider's current location
        'lng' => $order['rider_current_lng'],  // Rider's current location
        'rider_location_updated' => $order['rider_location_updated'],
        // ... rest of fields ...
    ]
];
?>
```

**Important Notes:**
- Only return rider location when `order.st` is 3 or 4 (assigned/on the way)
- Return `null` for rider location if it hasn't been updated in the last 5 minutes (stale data)

**Example with staleness check:**
```php
<?php
// Check if location is fresh (updated within last 5 minutes)
$location_updated = strtotime($order['rider_location_updated']);
$current_time = time();
$time_diff = $current_time - $location_updated;

// If location is older than 5 minutes, return null
if ($time_diff > 300) { // 300 seconds = 5 minutes
    $order['rider_current_lat'] = null;
    $order['rider_current_lng'] = null;
}
?>
```

---

## 3. Delivery Rider Mobile App Changes

### 3.1 Location Permission
Ensure the delivery app requests location permissions:
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- iOS: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`

### 3.2 Background Location Tracking
Implement background location service that:
1. Starts when rider accepts an order (status changes to 3)
2. Sends GPS updates every 5-10 seconds
3. Stops when order is completed (status changes to 5)

### 3.3 Example Implementation (React Native/Flutter)

**React Native Example:**
```javascript
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

let locationInterval = null;

// Start tracking when order is accepted
const startLocationTracking = (dboyId, orderId) => {
  locationInterval = setInterval(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Send to backend
        axios.post('https://bsitport2026.com/servex/api/updateRiderLocation', {
          dboy_id: dboyId,
          lat: latitude.toString(),
          lng: longitude.toString(),
          order_id: orderId
        }).catch(error => {
          console.error('Failed to update location:', error);
        });
      },
      (error) => console.error('Location error:', error),
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    );
  }, 5000); // Update every 5 seconds
};

// Stop tracking when order is completed
const stopLocationTracking = () => {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
};
```

---

## 4. Frontend Integration (Already Implemented)

The frontend code is already prepared to receive and display rider location:

**What the frontend expects:**
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "st": 4,
    "lat": "14.937004",      // Rider's current latitude
    "lng": "120.887896",     // Rider's current longitude
    "order": {
      "slat": "14.868958",   // Store latitude
      "slng": "120.800756",  // Store longitude
      "lat": "14.937004",    // Delivery latitude
      "lng": "120.887896"    // Delivery longitude
    }
  }
}
```

**Features already implemented in frontend:**
- ✅ Green marker for rider location
- ✅ Green route line from rider to delivery location
- ✅ Real-time updates every 2 seconds
- ✅ Automatic map centering
- ✅ Error handling for missing coordinates

---

## 5. Testing Checklist

### Backend Testing:
- [ ] Test `updateRiderLocation` endpoint with Postman
- [ ] Verify location is saved in database
- [ ] Test `orderDetail` returns rider location
- [ ] Test staleness check (old locations return null)

### Delivery App Testing:
- [ ] Location permissions granted
- [ ] GPS updates sent every 5-10 seconds
- [ ] Updates stop when order completed
- [ ] Works in background mode

### Frontend Testing:
- [ ] Green marker appears when rider location available
- [ ] Green route line shows from rider to delivery
- [ ] Map updates in real-time
- [ ] No errors when rider location unavailable

---

## 6. Performance Considerations

### Database Optimization:
```sql
-- Add index for faster queries
CREATE INDEX idx_dboy_location ON dboy(current_lat, current_lng, location_updated_at);
```

### API Rate Limiting:
Consider implementing rate limiting to prevent abuse:
- Max 1 location update per 3 seconds per rider
- Use Redis or similar for rate limiting

### Battery Optimization:
- Use GPS only when order is active (status 3 or 4)
- Reduce update frequency when rider is stationary
- Use network location when GPS unavailable

---

## 7. Security Considerations

1. **Authentication:** Ensure only authenticated riders can update their location
2. **Validation:** Validate lat/lng are valid coordinates
3. **Privacy:** Only show rider location to customers with active orders
4. **Data Retention:** Clear old location data after order completion

---

## 8. Troubleshooting

### Issue: Location not updating
- Check if delivery app has location permissions
- Verify API endpoint is accessible
- Check database connection
- Review app logs for errors

### Issue: Stale location showing
- Verify location_updated_at timestamp is current
- Check if staleness check is implemented
- Ensure delivery app is sending updates

### Issue: Green marker not showing on map
- Verify API returns `lat` and `lng` fields
- Check browser console for errors
- Ensure order status is 3 or 4
- Verify coordinates are valid numbers

---

## 9. Next Steps

1. **Implement database changes** (Section 1)
2. **Create updateRiderLocation endpoint** (Section 2.1)
3. **Modify orderDetail endpoint** (Section 2.2)
4. **Update delivery rider app** (Section 3)
5. **Test thoroughly** (Section 5)
6. **Deploy to production**

---

## Support

If you encounter any issues during implementation, please check:
- Database connection settings
- API endpoint URLs
- CORS configuration
- Mobile app permissions

For frontend issues, the code is already implemented and ready to work once the backend is set up.
