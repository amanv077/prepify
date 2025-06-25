# Cloudinary Setup Guide for Course Image Uploads

## Current Issue
The error "Upload preset not found" occurs because the upload preset "courses" doesn't exist in your Cloudinary account.

## Quick Solution Steps

### 1. Access Your Cloudinary Dashboard
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. Log in with your account (cloud name: `dwvifkvqi`)

### 2. Create the Upload Preset
1. In the dashboard, navigate to **Settings** → **Upload**
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `courses`
   - **Signing Mode**: Select **Unsigned** (important for client-side uploads)
   - **Use filename**: ✓ (optional)
   - **Unique filename**: ✓ (recommended to avoid conflicts)
   - **Folder**: `courses` (optional, to organize uploads)
   - **Resource type**: Auto
   - **Access control**: Token (default)
   - **File size limit**: Set reasonable limit (e.g., 10MB)
   - **Allowed formats**: jpg, jpeg, png, webp, gif
5. Click **Save**

### 3. Verify Configuration
After creating the preset, test the upload functionality in your app:
1. Go to `/admin/courses/create` in your app
2. Try uploading an image
3. The upload should now work without errors

## Alternative: Use Default Preset (Temporary Fix)

If you want to test immediately without creating a custom preset, you can temporarily use the default unsigned preset:

1. In your `.env.local`, change:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="ml_default"
   ```

2. This will use Cloudinary's default unsigned preset (if enabled)

## Environment Variables (Current Configuration)
```bash
CLOUDINARY_CLOUD_NAME="dwvifkvqi"
CLOUDINARY_API_KEY="856472637538788"
CLOUDINARY_API_SECRET="Qw9LJj6nhQjjyJklt7GSpzdzFCs"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dwvifkvqi"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="courses"
```

## Troubleshooting

### If you still get "Upload preset not found":
1. Double-check the preset name is exactly "courses" (case-sensitive)
2. Ensure the preset is set to "Unsigned" mode
3. Try using the browser's developer tools to see the exact error response

### If uploads work but images don't appear:
1. Check if the returned URL is accessible
2. Verify the cloudinary URL format in the database
3. Check if there are any CORS issues

### Security Notes:
- Unsigned presets are necessary for client-side uploads
- Consider adding transformation parameters to optimize images
- Set appropriate file size and format restrictions
- For production, consider implementing additional validation

## Production Considerations
1. Set up folder organization for better asset management
2. Configure auto-optimization settings
3. Set up webhooks for upload notifications (optional)
4. Consider implementing server-side upload for sensitive content
