'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { showToast } from '@/components/ui/toaster'
import { ButtonLoader } from '@/components/ui/loader'

interface PasswordStrength {
  score: number
  feedback: string
  color: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',    password: '',
    confirmPassword: '',
    role: 'USER'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const router = useRouter()

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    let feedback = ''
    
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score < 3) {
      feedback = 'Weak'
      return { score, feedback, color: 'bg-red-500' }
    } else if (score < 5) {
      feedback = 'Medium'
      return { score, feedback, color: 'bg-yellow-500' }
    } else {
      feedback = 'Strong'
      return { score, feedback, color: 'bg-green-500' }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      showToast.error('Password must be at least 8 characters long')
      setLoading(false)
      return
    }    const loadingToast = showToast.loading('Creating your account...')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      // Always dismiss loading toast first
      showToast.dismiss(loadingToast)

      if (response.ok) {
        showToast.interviewSuccess('Account created successfully! Check your email for verification.')
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        }, 2000)
      } else {
        showToast.error(data.error || 'Registration failed')
      }
    } catch (err) {
      // Always dismiss loading toast first
      showToast.dismiss(loadingToast)
      showToast.error('Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'USER':
        return { icon: '👤', name: 'User', color: 'bg-blue-500', borderColor: 'border-blue-500' }
      case 'AGENT':        return { icon: '🏢', name: 'Agent', color: 'bg-green-500', borderColor: 'border-green-500' }
      default:
        return { icon: '👤', name: 'User', color: 'bg-blue-500', borderColor: 'border-blue-500' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="mx-auto w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-2">            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-black mb-1">
            Create Account
          </h1>
          <p className="text-sm text-black">
            Join us and get started today
          </p>
        </div>        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black mb-1"
              >
                Full Name
              </label>              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 bg-gray-50 focus:bg-white text-black text-sm"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>            {/* Email */}
            <div>              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-1"
              >
                Email Address
              </label>              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 bg-gray-50 focus:bg-white text-black text-sm"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>{" "}            {/* Account Type */}            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Account Type
              </label>{" "}
              <div className="grid grid-cols-2 gap-3">
                {["USER", "AGENT"].map((roleType) => {
                  const roleInfo = getRoleInfo(roleType);
                  const isSelected = formData.role === roleType;
                  return (
                    <button
                      key={roleType}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: roleType })
                      }
                      className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-center group ${
                        isSelected
                          ? `${roleInfo.borderColor} bg-gradient-to-br from-white to-gray-50 shadow-md`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm ${
                          isSelected
                            ? roleInfo.color
                            : "bg-gray-400"
                        }`}
                      >
                        {roleInfo.icon}
                      </div>                      <div
                        className={`font-medium text-xs ${
                          isSelected ? "text-black" : "text-black"
                        }`}
                      >
                        {roleInfo.name}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <div
                            className={`w-5 h-5 ${roleInfo.color} rounded-full flex items-center justify-center`}
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 bg-gray-50 focus:bg-white pr-10 text-black text-sm"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-black">
                      Strength
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.feedback === "Weak"
                          ? "text-red-600"
                          : passwordStrength.feedback === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>            {/* Confirm Password */}
            <div>              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-black mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400 bg-gray-50 focus:bg-white pr-10 text-black text-sm ${
                    formData.confirmPassword === ""
                      ? "border-gray-300"
                      : passwordsMatch
                      ? "border-green-300 focus:border-green-500"
                      : "border-red-300 focus:border-red-500"
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                  {formData.confirmPassword && (
                    <div className="mr-1">
                      {passwordsMatch ? (
                        <svg
                          className="h-4 w-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-600">
                  Passwords do not match
                </p>
              )}            </div>

            {/* Submit Button */}{" "}
            <button
              type="submit"
              disabled={
                loading || !passwordsMatch || formData.password.length < 8
              }
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-sm"            >
              {loading ? (
                <>
                  <ButtonLoader size="sm" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-black text-xs">
                  Already have an account?
                </span>
              </div>
            </div>            <Link
              href="/login"
              className="w-full bg-gray-100 text-black py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center text-sm"
            >
              Sign in instead
            </Link>
          </div>
        </div>

        {/* Back to Home */}        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-black hover:text-gray-800 font-medium transition-colors text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
