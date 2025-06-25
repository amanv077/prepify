/**
 * Cloudinary image upload utility
 */

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
  [key: string]: any
}

interface UploadOptions {
  maxSizeBytes?: number
  allowedFormats?: string[]
  folder?: string
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  folder: 'course-images'
}

export class CloudinaryUploadError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'CloudinaryUploadError'
  }
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImageToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Validate file size
  if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
    throw new CloudinaryUploadError(
      `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(opts.maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`
    )
  }

  // Validate file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (opts.allowedFormats && fileExtension && !opts.allowedFormats.includes(fileExtension)) {
    throw new CloudinaryUploadError(
      `File format .${fileExtension} is not allowed. Allowed formats: ${opts.allowedFormats.join(', ')}`
    )
  }

  // Check required environment variables
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  let uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName) {
    throw new CloudinaryUploadError('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set')
  }

  if (!uploadPreset) {
    throw new CloudinaryUploadError('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variable is not set')
  }

  // Add helpful debug info for developers
  console.log('Cloudinary upload attempt:', {
    cloudName,
    uploadPreset,
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
  })

  // Prepare form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  
  if (opts.folder) {
    formData.append('folder', opts.folder)
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Provide more helpful error messages for common issues
      if (errorData.message?.includes('Upload preset not found')) {
        throw new CloudinaryUploadError(
          `Upload preset "${uploadPreset}" not found. Please create this preset in your Cloudinary dashboard at https://cloudinary.com/console/settings/upload. Make sure it's set to "Unsigned" mode.`
        )
      }
      
      if (errorData.message?.includes('Upload preset must be specified')) {
        throw new CloudinaryUploadError(
          'Upload preset is required for unsigned uploads. Please check your NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variable.'
        )
      }
      
      throw new CloudinaryUploadError(
        errorData.message || `Upload failed with status ${response.status}`,
        errorData
      )
    }

    const result: CloudinaryResponse = await response.json()
    
    if (!result.secure_url) {
      throw new CloudinaryUploadError('Invalid response from Cloudinary - missing secure_url')
    }

    return result
  } catch (error) {
    if (error instanceof CloudinaryUploadError) {
      throw error
    }
    
    throw new CloudinaryUploadError(
      error instanceof Error ? error.message : 'Unknown upload error',
      error
    )
  }
}

/**
 * Delete an image from Cloudinary (requires server-side implementation)
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ public_id: publicId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to delete image')
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw error
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.[^.]+$/)
    return matches ? matches[1] : null
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
    return null
  }
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function generateOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
    crop?: string
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set')
  }

  const transformations = []
  
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.quality) transformations.push(`q_${options.quality}`)
  if (options.format) transformations.push(`f_${options.format}`)
  if (options.crop) transformations.push(`c_${options.crop}`)

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`
}
