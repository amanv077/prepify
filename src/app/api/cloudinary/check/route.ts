import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({
        configured: false,
        error: 'Missing environment variables',
        missing: {
          cloudName: !cloudName,
          uploadPreset: !uploadPreset
        }
      }, { status: 400 });
    }

    // Test the upload preset by making a simple request
    const testFormData = new FormData();
    testFormData.append('upload_preset', uploadPreset);
    testFormData.append('file', 'data:text/plain;base64,dGVzdA=='); // "test" in base64

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: testFormData
      }
    );

    const result = await response.json();

    if (response.status === 400 && result.message?.includes('Upload preset not found')) {
      return NextResponse.json({
        configured: false,
        error: `Upload preset "${uploadPreset}" not found`,
        instructions: [
          'Go to https://cloudinary.com/console/settings/upload',
          'Add upload preset named "courses"',
          'Set signing mode to "Unsigned"',
          'Save the preset'
        ]
      });
    }

    if (response.status === 400 && result.message?.includes('Invalid image file')) {
      // This is expected for our test data, means preset exists
      return NextResponse.json({
        configured: true,
        cloudName,
        uploadPreset,
        message: 'Cloudinary is properly configured'
      });
    }

    if (response.ok) {
      // Unexpected success, but still means it's configured
      return NextResponse.json({
        configured: true,
        cloudName,
        uploadPreset,
        message: 'Cloudinary is properly configured'
      });
    }

    return NextResponse.json({
      configured: false,
      error: result.message || 'Unknown error',
      details: result
    });

  } catch (error) {
    console.error('Error checking Cloudinary configuration:', error);
    return NextResponse.json({
      configured: false,
      error: 'Failed to check configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
