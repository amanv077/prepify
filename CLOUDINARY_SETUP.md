# Cloudinary Setup Guide

## Creating an Upload Preset for Course Images

To fix the "Upload preset must be specified" error, you need to create an upload preset in your Cloudinary dashboard.

### Steps:

1. **Go to Cloudinary Dashboard**
   - Visit: https://cloudinary.com/console
   - Log in with your account

2. **Navigate to Upload Settings**
   - Click on "Settings" (gear icon) in the top right
   - Select "Upload" from the left sidebar

3. **Create Upload Preset**
   - Scroll down to "Upload presets" section
   - Click "Add upload preset"

4. **Configure the Preset**
   - **Preset name**: `courses`
   - **Signing mode**: `Unsigned` (important!)
   - **Folder**: `course-images` (optional, for organization)
   - **Resource type**: `Image`
   - **Access mode**: `Public`

5. **Image Transformations (Optional)**
   - **Format**: `Auto` (automatically chooses best format)
   - **Quality**: `Auto` (automatically optimizes quality)
   - **Max file size**: `5MB`
   - **Max dimensions**: `1200x800` (optional, for consistency)

6. **Save the Preset**
   - Click "Save" at the bottom

### Environment Variables

Make sure your `.env.local` file contains:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dwvifkvqi"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="courses"
```

### Security Note

The upload preset is set to "Unsigned" which allows client-side uploads without authentication. This is suitable for course images but ensure you have proper validation on your server side.

### Verification

After creating the preset, restart your development server:

```bash
npm run dev
```

Then try uploading a course image again. The upload should now work successfully.
