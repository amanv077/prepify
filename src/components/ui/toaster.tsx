'use client'

import toast, { Toaster } from 'react-hot-toast'

// Optimized Toaster component with better positioning and auto-dismiss
export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: '80px', // Better positioning below navbar
        right: '20px',
        zIndex: 9999,
      }}
      toastOptions={{
        // Global toast options
        duration: 4000, // Auto dismiss after 4 seconds
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
          minWidth: '300px',
        },
        // Success toasts
        success: {
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #22c55e',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        // Error toasts
        error: {
          duration: 6000, // Keep errors longer
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        // Loading toasts
        loading: {
          duration: Infinity, // Loading toasts don't auto-dismiss
          style: {
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #3b82f6',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        },
      }}
    />
  )
}

// Enhanced toast utility functions with interview themes
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      icon: '🎯',
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  error: (message: string) => {
    return toast.error(message, {
      icon: '❌',
      style: {
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderLeft: '4px solid #ef4444',
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      icon: '💼',
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
        borderLeft: '4px solid #3b82f6',
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      loading: {
        icon: '💼',
        style: {
          background: '#eff6ff',
          color: '#1e40af',
          border: '1px solid #bfdbfe',
          borderLeft: '4px solid #3b82f6',
        },
      },
      success: {
        icon: '🎯',
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderLeft: '4px solid #22c55e',
        },
      },
      error: {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderLeft: '4px solid #ef4444',
        },
      },
    })
  },

  // Interview-specific themed toasts
  interviewSuccess: (message: string = "Great job! You're making excellent progress!") => {
    return toast.success(message, {
      icon: '🎉',
      duration: 5000,
      style: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
        color: '#166534',
        border: '1px solid #22c55e',
        borderLeft: '4px solid #22c55e',
        fontWeight: '600',
      },
    })
  },

  applicationSubmitted: (message: string = "Application submitted successfully!") => {
    return toast.success(message, {
      icon: '📝',
      duration: 5000,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  interviewScheduled: (message: string = "Interview scheduled! Check your email for details.") => {
    return toast.success(message, {
      icon: '📅',
      duration: 6000,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },

  dismissAll: () => {
    toast.dismiss()
  }
}
