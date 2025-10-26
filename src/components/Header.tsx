import React, { useState } from 'react'
import { Bell, Search, User, Settings, HelpCircle, ChevronDown, Zap, Clock, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const Header: React.FC = () => {
  const { user } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getRoleColor = (role: string) => {
    if (role?.includes('MANAGING_PARTNER')) return 'bg-red-100 text-red-800 border-red-200'
    if (role?.includes('PARTNER')) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (role?.includes('SENIOR_ASSOCIATE')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (role?.includes('JUNIOR_ASSOCIATE')) return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    if (role?.includes('LEGAL_ASSISTANT')) return 'bg-green-100 text-green-800 border-green-200'
    if (role?.includes('ACCOUNTANT')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (role?.includes('OFFICE_MANAGER')) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (role?.includes('RECORDS_MANAGER')) return 'bg-teal-100 text-teal-800 border-teal-200'
    if (role?.includes('COUNSELOR')) return 'bg-pink-100 text-pink-800 border-pink-200'
    return 'bg-gray-100 text-neutral-800 border-gray-200'
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Section */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, cases, documents..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded-md">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Zap className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Clock className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              3
            </span>
          </button>

          {/* User Role & Department */}
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getRoleColor(user?.role || '')}`}>
              {user?.role?.replace(/_/g, ' ')}
            </div>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200">
              {user?.department?.replace(/_/g, ' ')}
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-neutral-50 rounded-xl transition-all duration-200"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-medium">
                  <span className="text-xs font-bold text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.position || user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-hard border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`px-2 py-1 text-xs font-medium rounded-md ${getRoleColor(user?.role || '')}`}>
                      {user?.role?.replace(/_/g, ' ')}
                    </div>
                    <div className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                      {user?.department?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-neutral-50 transition-colors">
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-neutral-50 transition-colors">
                    <Settings className="h-4 w-4 mr-3" />
                    Preferences
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-neutral-50 transition-colors">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
