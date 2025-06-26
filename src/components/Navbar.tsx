'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonLoader } from '@/components/ui/loader'
import { Menu, X, User, LogOut, ChevronDown, Home, BookOpen, Trophy, DollarSign, MessageCircle, Settings } from 'lucide-react'
import { showToast } from '@/components/ui/toaster'
import Loader from '@/components/ui/loader'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const closeMenu = () => {
      setIsMenuOpen(false)
      setIsUserMenuOpen(false)
    }

    if (isMenuOpen || isUserMenuOpen) {
      document.addEventListener('click', closeMenu)
      return () => document.removeEventListener('click', closeMenu)
    }
  }, [isMenuOpen, isUserMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const getDashboardLink = () => {
    if (!session?.user?.role) return '/dashboard'
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin/dashboard'
      case 'AGENT':
        return '/agent/dashboard'
      default:
        return '/dashboard'
    }
  }

  const getProfileLink = () => {
    if (!session?.user?.role) return '/profile'
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin/profile'
      case 'AGENT':
        return '/agent/profile'
      default:
        return '/profile'
    }
  }

  const navLinks = [
    { href: '/about', label: 'About', icon: BookOpen },
    { href: '/programs', label: 'Programs', icon: BookOpen },
    { href: '/success-stories', label: 'Success Stories', icon: Trophy },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
    { href: '/contact', label: 'Contact', icon: MessageCircle },
  ]

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
      showToast.success('Signed out successfully')
    } catch (error) {
      showToast.error('Failed to sign out')
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Prepify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group cursor-pointer"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex items-center space-x-3">
                <div className="w-16 h-8 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : session ? (
              <div className="relative" onClick={handleMenuClick}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in slide-in-from-top-2 duration-200">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    <Link
                      href={getProfileLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>

                    <hr className="my-1" />

                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsUserMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200 cursor-pointer touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" />
            
            {/* Mobile Menu */}
            <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50 md:hidden animate-in slide-in-from-top-4 duration-300">
              <div className="max-h-[calc(100vh-4rem)] overflow-y-auto" onClick={handleMenuClick}>
                <div className="px-4 py-6 space-y-1">
                  {/* Navigation Links */}
                  {navLinks.map((link, index) => {
                    const IconComponent = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation group"
                        onClick={() => setIsMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <IconComponent className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    )
                  })}

                  {/* Auth Section */}
                  {status === 'loading' ? (
                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                      <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
                      <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
                    </div>
                  ) : session ? (
                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
                      {/* User Info */}
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                      </div>

                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Home className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                        <span className="font-medium">Dashboard</span>
                      </Link>

                      <Link
                        href={getProfileLink()}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                        <span className="font-medium">My Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation group"
                      >
                        <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-600 transition-colors duration-200" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                      <Link 
                        href="/login" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block"
                      >
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full justify-center hover:bg-gray-100 font-medium"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link 
                        href="/register" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block"
                      >
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}


