#!/usr/bin/env node

/**
 * Test script to verify Cloudinary configuration
 * Run with: node scripts/test-cloudinary.js
 */

const https = require('https');

const CLOUD_NAME = 'dwvifkvqi';
const UPLOAD_PRESET = 'courses';

function testCloudinaryPreset() {
  return new Promise((resolve, reject) => {
    // Test with a small dummy request to check if preset exists
    const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="upload_preset"\r\n\r\n${UPLOAD_PRESET}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\ntest\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`;
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 400 && response.message && response.message.includes('Upload preset not found')) {
            console.log('❌ Upload preset "courses" not found');
            console.log('📝 Please create the preset in your Cloudinary dashboard:');
            console.log('   1. Go to https://cloudinary.com/console/settings/upload');
            console.log('   2. Add upload preset named "courses"');
            console.log('   3. Set signing mode to "Unsigned"');
            resolve(false);
          } else if (res.statusCode === 400 && response.message && response.message.includes('Invalid image file')) {
            console.log('✅ Upload preset "courses" exists and is properly configured');
            console.log('   (Got expected error for invalid test file)');
            resolve(true);
          } else {
            console.log('🔄 Unexpected response:', response);
            console.log('   Status:', res.statusCode);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Network error:', error.message);
      reject(error);
    });

    req.write(formData);
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Cloudinary configuration...');
  console.log(`   Cloud Name: ${CLOUD_NAME}`);
  console.log(`   Upload Preset: ${UPLOAD_PRESET}`);
  console.log('');
  
  try {
    const isConfigured = await testCloudinaryPreset();
    
    if (isConfigured) {
      console.log('');
      console.log('🎉 Cloudinary is properly configured!');
      console.log('   You can now upload images in your application.');
    } else {
      console.log('');
      console.log('⚠️  Please follow the setup guide in CLOUDINARY_SETUP_GUIDE.md');
    }
  } catch (error) {
    console.log('');
    console.log('❌ Test failed:', error.message);
  }
}

main();
