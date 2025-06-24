# MongoDB Atlas IP Whitelist Setup

## Issue
Your MongoDB Atlas cluster is rejecting connections because your current IP address is not whitelisted.

## Quick Fix Options

### Option 1: Add Your Current IP (Recommended for Development)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster (Cluster0)
4. Go to **Network Access** in the left sidebar
5. Click **"Add IP Address"**
6. Choose **"Add Current IP Address"**
7. Click **"Confirm"**

### Option 2: Allow All IPs (NOT recommended for production)

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Enter `0.0.0.0/0` in the IP Address field
4. Add a comment like "Allow all IPs - Development only"
5. Click **"Confirm"**

### Option 3: Get Your Current IP and Add It

Run this command to get your current IP:
```bash
curl ifconfig.me
```

Then add that IP to your MongoDB Atlas whitelist.

## After Adding IP

1. Wait 1-2 minutes for the changes to propagate
2. Try registering a user again
3. The registration should now work properly

## Alternative: Use Local MongoDB (For Development)

If you prefer to use a local MongoDB instance:

1. Install MongoDB locally
2. Update your `.env.local` file:
   ```bash
   DATABASE_URL="mongodb://localhost:27017/prepify_db"
   ```
3. Start your local MongoDB service
4. Restart your Next.js development server

## Note

The current MongoDB Atlas connection string in your `.env.local` appears to be correctly formatted. The issue is purely related to IP whitelisting for security purposes.
