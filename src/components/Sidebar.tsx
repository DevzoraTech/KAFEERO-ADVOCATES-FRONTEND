import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import kcaLogo from '@/assets/kca-logo.webp'
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Receipt,
  Settings,
  LogOut,
  Scale,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Archive,
  Shield,
  UserCheck,
  Building2,
  Briefcase,
  FileSpreadsheet,
  Database,
  TrendingUp,
  Calendar,
  MessageSquare,
  Bot,
  Bell,
  CreditCard,
  Clock,
  UserPlus,
  DollarSign,
  Upload,
  Tag,
  Lock,
  Mail,
  Phone,
  HelpCircle,
  Megaphone,
  Globe,
  Zap,
  ShieldCheck,
  Palette,
  Download,
  AlertCircle
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { logout, user } = useAuthStore()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    administrator: true,
    caseManagement: true,
    humanResource: true,
    accountingFinance: true,
    documentRecords: true,
    communications: true,
    calendarManagement: true,
    documentAI: true,
    systemAdmin: false, // Keep admin collapsed by default
    settings: true,
    support: true
  })

  const navigationSections = [
    {
      title: 'Administrator',
      key: 'administrator',
      items: [
        { name: 'Firm Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
        { name: 'Department Performance', href: '/reports/department', icon: TrendingUp, module: 'reports' },
        { name: 'Case Load Overview', href: '/reports/case-load', icon: BarChart3, module: 'reports' },
        { name: 'Financial Summary', href: '/reports/financial', icon: DollarSign, module: 'reports' },
        { name: 'HR Summary', href: '/reports/hr', icon: Users, module: 'reports' },
        { name: 'Client Activity Reports', href: '/reports/client-activity', icon: UserCheck, module: 'reports' },
        { name: 'Risk & Compliance Reports', href: '/reports/compliance', icon: ShieldCheck, module: 'reports' },
      ]
    },
    {
      title: 'Case Management',
      key: 'caseManagement',
      items: [
        { 
          name: 'Cases', 
          href: '/cases', 
          icon: FileText, 
          module: 'cases',
          subItems: [
            { name: 'Dashboard', href: '/cases/dashboard', icon: BarChart3 },
            { name: 'All Matters', href: '/cases/all-cases', icon: Briefcase },
            { name: 'My Matters', href: '/cases/my-cases', icon: Briefcase },
            { name: 'Archived', href: '/cases/archived', icon: Archive },
            { name: 'Templates', href: '/cases/templates', icon: Settings, adminOnly: true },
            { name: 'Reports & Analytics', href: '/cases/reports', icon: BarChart3 }
          ]
        },
        { name: 'Clients', href: '/clients', icon: Users, module: 'clients' },
      ]
    },
    {
      title: 'Human Resource',
      key: 'humanResource',
      items: [
        { name: 'HR Dashboard', href: '/hr/dashboard', icon: LayoutDashboard, module: 'hr' },
        { name: 'Employee Directory', href: '/hr/employees', icon: Users, module: 'hr' },
        { name: 'Attendance & Leave', href: '/hr/attendance', icon: Clock, module: 'hr' },
        { name: 'Recruitment & Onboarding', href: '/hr/recruitment', icon: UserPlus, module: 'hr' },
        { name: 'Payroll & Benefits', href: '/hr/payroll', icon: CreditCard, module: 'hr' },
        { name: 'HR Reports', href: '/hr/reports', icon: BarChart3, module: 'hr' },
      ]
    },
    {
      title: 'Accounting & Finance',
      key: 'accountingFinance',
      items: [
        { name: 'Finance Dashboard', href: '/finance/dashboard', icon: LayoutDashboard, module: 'finance' },
        { name: 'Billing & Invoicing', href: '/finance/billing', icon: Receipt, module: 'finance' },
        { name: 'Payments & Receipts', href: '/finance/payments', icon: CreditCard, module: 'finance' },
        { name: 'Expenses & Disbursements', href: '/finance/expenses', icon: DollarSign, module: 'finance' },
        { name: 'Audit & Compliance Reports', href: '/finance/audit', icon: ShieldCheck, module: 'finance' },
      ]
    },
    {
      title: 'Document & Records',
      key: 'documentRecords',
      items: [
        { name: 'Repository Dashboard', href: '/documents/dashboard', icon: LayoutDashboard, module: 'documents' },
        { name: 'Upload / New Document', href: '/documents/upload', icon: Upload, module: 'documents' },
        { name: 'Version Control', href: '/documents/versions', icon: FileText, module: 'documents' },
        { name: 'Tagging & Classification', href: '/documents/tags', icon: Tag, module: 'documents' },
        { name: 'Records Archive', href: '/documents/archive', icon: Archive, module: 'documents' },
        { name: 'Access & Permissions', href: '/documents/permissions', icon: Lock, module: 'documents' },
      ]
    },
    {
      title: 'Communications',
      key: 'communications',
      items: [
        { name: 'Messages', href: '/communications/messages', icon: MessageSquare, module: 'communications' },
        { name: 'Meeting Scheduler', href: '/communications/scheduler', icon: Calendar, module: 'communications' },
        { name: 'Notifications & Alerts', href: '/communications/notifications', icon: Bell, module: 'communications' },
      ]
    },
    {
      title: 'Calendar Management',
      key: 'calendarManagement',
      items: [
        { name: 'Firm Calendar', href: '/calendar/firm', icon: Calendar, module: 'calendar' },
        { name: 'Appointments', href: '/calendar/appointments', icon: Clock, module: 'calendar' },
      ]
    },
    {
      title: 'Document AI Chat',
      key: 'documentAI',
      items: [
        { name: 'Chat with Document', href: '/ai/chat', icon: Bot, module: 'ai' },
        { name: 'Case Summary Generator', href: '/ai/summary', icon: FileText, module: 'ai' },
      ]
    },
    {
      title: 'System Administration',
      key: 'systemAdmin',
      items: [
        { name: 'User & Role Management', href: '/users', icon: UserCheck, module: 'admin' },
        { name: 'Department Access Control', href: '/admin/access', icon: Lock, module: 'admin' },
        { name: 'Integrations', href: '/admin/integrations', icon: Zap, module: 'admin' },
        { name: 'Notification Templates', href: '/admin/templates', icon: Mail, module: 'admin' },
        { name: 'Data Management & Backup', href: '/admin/backup', icon: Database, module: 'admin' },
        { name: 'Compliance & Privacy Settings', href: '/admin/compliance', icon: ShieldCheck, module: 'admin' },
      ]
    },
    {
      title: 'Settings',
      key: 'settings',
      items: [
        { name: 'My Profile', href: '/profile', icon: UserCheck, module: 'profile' },
        { name: 'Theme & Appearance', href: '/settings/theme', icon: Palette, module: 'settings' },
        { name: 'Notifications', href: '/settings/notifications', icon: Bell, module: 'settings' },
      ]
    },
    {
      title: 'Support & Help Center',
      key: 'support',
      items: [
        { name: 'Contact Support', href: '/support/contact', icon: HelpCircle, module: 'support' },
        { name: 'Announcements / Updates', href: '/support/announcements', icon: Megaphone, module: 'support' },
      ]
    }
  ]

  // Filter navigation based on user permissions
  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Always show profile and settings
      if (item.module === 'profile' || item.module === 'settings') return true
      
      // Show admin sections only to admin users
      if (item.module === 'admin' || item.adminOnly) {
        return user?.permissions?.canManageSettings || user?.role === 'MANAGING_PARTNER_CEO'
      }
      
      // For now, show all other sections to all users (can be refined later)
      return true
    })
  })).filter(section => section.items.length > 0)

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex flex-col w-72 bg-gray-100 border-r border-gray-200 shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-28 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl backdrop-blur-sm p-2">
            <img 
              src={kcaLogo} 
              alt="KCA Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white leading-tight">Kafeero & Co Advocates</h1>
            <p className="text-sm text-blue-100 leading-tight">Legal Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredSections.map((section) => {
          // Check if any item in this section is active
          const isSectionActive = section.items.some(item => {
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isSubItemActive = hasSubItems && item.subItems?.some(subItem => location.pathname === subItem.href)
            return location.pathname === item.href || isSubItemActive
          })
          
          return (
            <div key={section.title} className="space-y-1">
              {/* Section Header */}
              {section.key ? (
                <div 
                  onClick={() => toggleSection(section.key!)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md transition-all duration-200 cursor-pointer hover:bg-gray-300 ${
                    isSectionActive ? 'bg-blue-600 border-l-4 border-blue-800 shadow-lg hover:bg-blue-700' : 'bg-gray-200'
                  }`}
                >
                  <h3 className={`text-sm font-bold uppercase tracking-wide truncate ${
                    isSectionActive ? 'text-white' : 'text-gray-800'
                  }`}>
                    {section.title}
                  </h3>
                  <div className={`p-1 transition-colors ${
                    isSectionActive ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {expandedSections[section.key!] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex items-center justify-between px-2 py-1.5 rounded-md transition-all duration-200 ${
                  isSectionActive ? 'bg-blue-600 border-l-4 border-blue-800 shadow-lg' : 'bg-gray-200'
                }`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wide truncate ${
                    isSectionActive ? 'text-white' : 'text-gray-800'
                  }`}>
                    {section.title}
                  </h3>
                </div>
              )}

            {/* Section Items */}
            {(!section.key || expandedSections[section.key]) && (
              <div className="space-y-1">
                {section.items.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0
                  const isSubItemActive = hasSubItems && item.subItems?.some(subItem => location.pathname === subItem.href)
                  const isActive = location.pathname === item.href || isSubItemActive
                  
                  return (
                    <div key={item.name}>
                      {hasSubItems ? (
                        // For items with sub-items, make the entire area clickable to toggle
                        <div
                          onClick={() => toggleSection(item.name.toLowerCase().replace(/\s+/g, '-'))}
                          className={`nav-item cursor-pointer ${
                            isActive ? 'nav-item-active' : 'nav-item-inactive'
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{item.name}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleSection(item.name.toLowerCase().replace(/\s+/g, '-'))
                            }}
                            className="ml-auto p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {expandedSections[item.name.toLowerCase().replace(/\s+/g, '-')] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {isActive && (
                            <div className="ml-auto flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span className="text-xs text-blue-600 font-semibold">ACTIVE</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // For items without sub-items, use normal Link
                        <Link
                          to={item.href}
                          className={`nav-item ${
                            isActive ? 'nav-item-active' : 'nav-item-inactive'
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{item.name}</span>
                          {isActive && (
                            <div className="ml-auto flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span className="text-xs text-blue-600 font-semibold">ACTIVE</span>
                            </div>
                          )}
                        </Link>
                      )}
                      
                      {/* Sub Items */}
                      {hasSubItems && expandedSections[item.name.toLowerCase().replace(/\s+/g, '-')] && (
                        <div className="ml-6 space-y-1 mt-1">
                          {item.subItems?.map((subItem) => {
                            const isSubActive = location.pathname === subItem.href
                            const canAccess = !subItem.adminOnly || user?.permissions?.canManageSettings || user?.role === 'MANAGING_PARTNER_CEO'
                            
                            if (!canAccess) return null
                            
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className={`nav-item text-lg ${
                                  isSubActive ? 'nav-item-active' : 'nav-item-inactive'
                                }`}
                              >
                                <subItem.icon className="w-3 h-3 mr-2 flex-shrink-0" />
                                <span className="font-medium text-xs truncate">{subItem.name}</span>
                                {subItem.adminOnly && (
                                  <span className="ml-auto px-2 py-1 text-base bg-purple-100 text-purple-800 rounded-full">
                                    Admin
                                  </span>
                                )}
                                {isSubActive && (
                                  <div className="ml-auto flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-xs text-blue-600 font-semibold">ACTIVE</span>
                                  </div>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-base text-gray-500 truncate">
                {user?.position || user?.role?.replace(/_/g, ' ')}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-base text-gray-400">Online</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-lg font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

