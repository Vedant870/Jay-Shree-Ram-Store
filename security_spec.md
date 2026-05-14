# Security Specification for JSR Order App

## Data Invariants
1. **Products**: Only admins can create or update products. Customers can only read.
2. **Orders**: 
   - Customers can create orders but only for themselves (`customerId` must match `auth.uid`).
   - Customers can read their own orders.
   - Admins can read and update all orders (e.g., change status).
   - `totalAmount` must be positive.
   - `status` transitions must be valid (e.g., cannot change from 'delivered' to 'pending').
3. **Users**: 
   - Users can read and update their own profile.
   - Users cannot change their own `role` (must be protected).
   - Admins can read all profiles.

## The Dirty Dozen Payloads

1. **Identity Spoofing (Order)**: User A creates an order with `customerId: "UserB"`.
2. **Privilege Escalation (User)**: Customer updates their own `role` to `"admin"`.
3. **Shadow Field (Product)**: Admin updates a product with a `discountCode: "FREE100"` field not in schema.
4. **Invalid ID (Product)**: Attempting to create a product with a 2KB string as ID.
5. **State Shortcut (Order)**: Customer updates order status directly to `"delivered"`.
6. **Orphaned Order**: Creating an order for a `customerId` that doesn't exist in `/users`.
7. **Terminal State Break**: Updating an order that is already in `"delivered"` status.
8. **PII Leak**: Authenticated user attempts to list all users and their emails/phones.
9. **Price Manipulation**: Customer creates an order with `totalAmount: -500`.
10. **Data Poisoning (Product)**: Admin sets product name to a 1MB string.
11. **Route Hijacking**: Customer updates their `route` in `UserProfile` to access different delivery zones they don't belong to (if routes were sensitive).
12. **Timestamp Fraud**: Creating an order with a `createdAt` in the future (client-provided).

## Test Runner Plan
I will implement `firestore.rules` containing helpers that check these invariants and reject these payloads.
