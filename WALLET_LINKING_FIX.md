# Wallet Linking Fix for Payment Release

## Problem
When creators tried to approve and release payments, they encountered the error:
```
Creator Stellar wallet not configured
```

## Root Cause
When users connected their Stellar wallet through the frontend (using Stellar Wallets Kit), the wallet address was only stored in the frontend state. It was **NOT** being saved to the backend user profile in the database. 

When the payment approval endpoint checked for `creatorUser.stellarPublicKey`, it was null because the wallet was never linked to the user's profile.

## Solution

### 1. Frontend Changes (`frontend/src/contexts/WalletContext/index.jsx`)

**Added import:**
```javascript
import { linkStellarWallet, getAuthToken } from '../../utils/auth';
```

**Updated wallet connection flow:**
After a wallet is successfully connected, the system now automatically:
1. Checks if the user is authenticated (has a valid JWT token)
2. Calls the backend API to link the wallet address to the user's profile
3. Stores the `stellarPublicKey` in the database

The update happens in the `onWalletSelected` callback:
```javascript
// Link wallet to user profile if authenticated
const authToken = getAuthToken();
if (authToken) {
    try {
        console.log('🔗 Linking wallet to user profile...');
        await linkStellarWallet(address);
        console.log('✅ Wallet linked to user profile successfully');
    } catch (linkError) {
        console.error('⚠️ Failed to link wallet to user profile:', linkError);
        // Don't block wallet connection if linking fails
    }
} else {
    console.log('⚠️ User not authenticated - wallet not linked to profile');
}
```

### 2. Backend Changes (`backend/src/routes/auth.js`)

**Made `wallet` parameter optional:**
The `/api/auth/link-wallet` endpoint now accepts just the `stellarPublicKey`. If `wallet` is not provided, it uses `stellarPublicKey` for both fields.

```javascript
// Update wallet if provided, otherwise use stellarPublicKey for both
user.wallet = wallet || stellarPublicKey;
user.stellarPublicKey = stellarPublicKey;
```

### 3. Improved Error Message (`backend/src/routes/workSubmissions.js`)

Updated the error message to be more helpful:
```javascript
message: 'Creator Stellar wallet not configured. Please connect your Stellar wallet on the platform before releasing payments.'
```

## Testing Instructions

### Prerequisites
1. Backend server running on `http://localhost:8888`
2. Frontend running on the configured `FRONTEND_URL`
3. User authenticated via GitHub OAuth

### Test Steps

1. **Login/Authentication**
   - Login to the platform using GitHub OAuth
   - Verify you're authenticated (JWT token stored)

2. **Connect Stellar Wallet**
   - Click "Connect Wallet" button
   - Select your Stellar wallet (Freighter, Albedo, etc.)
   - Approve the connection
   - **Watch the console logs** - you should see:
     ```
     🔗 Linking wallet to user profile...
     ✅ Wallet linked to user profile successfully
     ```

3. **Verify Backend Storage**
   - Check the user document in MongoDB
   - The `stellarPublicKey` field should now contain your wallet address
   - Example:
     ```javascript
     {
       _id: ObjectId("..."),
       github: "yourusername",
       stellarPublicKey: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
       // ... other fields
     }
     ```

4. **Create a Bounty**
   - Create a new bounty as usual
   - Ensure it goes through all the steps successfully

5. **Test Payment Release**
   - Have someone apply and submit work for your bounty
   - Approve the work and release payment
   - The payment should now process successfully without the "Creator Stellar wallet not configured" error

### Troubleshooting

**If wallet linking fails:**
- Check the browser console for error messages
- Verify the JWT token is valid: `localStorage.getItem('authToken')`
- Check backend logs for any API errors
- Ensure the backend `/api/auth/link-wallet` endpoint is accessible

**If payment still fails:**
- Verify the creator's wallet has sufficient XLM balance
- Check that the `SECRETKEY` environment variable is set in the backend
- Ensure the Stellar account exists on the network

## Important Notes

1. **Automatic Linking**: Wallets are now automatically linked when users connect via the wallet modal. No additional action required.

2. **Re-authentication**: If a user was already connected before this fix, they need to:
   - Disconnect their wallet
   - Reconnect it again (this will trigger the linking)

3. **Multiple Devices**: If a user connects their wallet on a different device/browser, the last connected wallet will be saved in their profile.

4. **Security**: The `stellarPublicKey` stored is the PUBLIC key only, which is safe to store. Secret keys are never stored in the database.

## Files Modified

1. `frontend/src/contexts/WalletContext/index.jsx`
   - Added wallet linking on connection
   - Added authentication check

2. `backend/src/routes/auth.js`
   - Made `wallet` parameter optional
   - Use `stellarPublicKey` for both fields if `wallet` not provided

3. `backend/src/routes/workSubmissions.js`
   - Improved error message for better user guidance

## Related Files

- `frontend/src/utils/auth.js` - Contains `linkStellarWallet` function
- `backend/src/models/user.js` - User schema with `stellarPublicKey` field
- `backend/src/stellar/payment.js` - Stellar payment functions
