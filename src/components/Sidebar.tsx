import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Receipt,
  Settings,
  LogOut,
  Scale
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Cases', href: '/cases', icon: FileText },
    { name: 'Documents', href: '/documents', icon: FolderOpen },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Profile', href: '/profile', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary">
        <Scale className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">Kafeero Advocates</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
