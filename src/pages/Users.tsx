import React, { useState, useEffect } from 'react'
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  department: string
  position?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  department: string
  position: string
}

const Users: React.FC = () => {
  const { user: currentUser, token, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showTempPassword, setShowTempPassword] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    department: '',
    position: ''
  })

  // Role and Department options based on organizational chart
  const roleOptions = [
    { value: 'MANAGING_PARTNER_CEO', label: 'Managing Partner & CEO', department: 'EXECUTIVE' },
    { value: 'EQUITY_PARTNER_CO_OWNER', label: 'Equity Partner & Co-Owner', department: 'EXECUTIVE' },
    { value: 'HEAD_OF_BUSINESS_OPERATIONS', label: 'Head of Business Operations', department: 'EXECUTIVE' },
    { value: 'SENIOR_ASSOCIATE_COMMON_LAW', label: 'Senior Associate (Common Law)', department: 'LEGAL_COMMON_LAW' },
    { value: 'JUNIOR_ASSOCIATE_COMMON_LAW', label: 'Junior Associate (Common Law)', department: 'LEGAL_COMMON_LAW' },
    { value: 'LEGAL_ASSISTANT_COMMON_LAW', label: 'Legal Assistant (Common Law)', department: 'LEGAL_COMMON_LAW' },
    { value: 'INTERN_COMMON_LAW', label: 'Intern (Common Law)', department: 'LEGAL_COMMON_LAW' },
    { value: 'CLERK_COMMON_LAW', label: 'Clerk (Common Law)', department: 'LEGAL_COMMON_LAW' },
    { value: 'SENIOR_ASSOCIATE_SHARIA', label: 'Senior Associate (Sharia)', department: 'LEGAL_SHARIA' },
    { value: 'JUNIOR_ASSOCIATE_SHARIA', label: 'Junior Associate (Sharia)', department: 'LEGAL_SHARIA' },
    { value: 'LEGAL_ASSISTANT_SHARIA', label: 'Legal Assistant (Sharia)', department: 'LEGAL_SHARIA' },
    { value: 'INTERN_SHARIA', label: 'Intern (Sharia)', department: 'LEGAL_SHARIA' },
    { value: 'CLERK_SHARIA', label: 'Clerk (Sharia)', department: 'LEGAL_SHARIA' },
    { value: 'ACCOUNTANT', label: 'Accountant', department: 'FINANCE' },
    { value: 'ASSISTANT_ACCOUNTANT', label: 'Assistant Accountant', department: 'FINANCE' },
    { value: 'OFFICE_MANAGER', label: 'Office Manager', department: 'ADMIN_HR' },
    { value: 'MAINTENANCE_SERVICES', label: 'Maintenance Services', department: 'ADMIN_HR' },
    { value: 'FRONT_DESK', label: 'Front Desk', department: 'ADMIN_HR' },
    { value: 'CLEANER', label: 'Cleaner', department: 'ADMIN_HR' },
    { value: 'CHEF', label: 'Chef', department: 'ADMIN_HR' },
    { value: 'SECURITY', label: 'Security', department: 'ADMIN_HR' },
    { value: 'OFFICE_MESSENGER', label: 'Office Messenger', department: 'ADMIN_HR' },
    { value: 'RECORDS_MANAGER', label: 'Records Manager', department: 'RECORDS' },
    { value: 'RECORDS_ASSISTANT', label: 'Records Assistant', department: 'RECORDS' },
    { value: 'COUNSELOR', label: 'Counselor', department: 'GUIDANCE_COUNSELING' },
    { value: 'PRIVATE_SECRETARY_TO_CEO', label: 'Private Secretary to CEO', department: 'EXECUTIVE' }
  ]

  const departmentOptions = [
    { value: 'EXECUTIVE', label: 'Executive' },
    { value: 'LEGAL_COMMON_LAW', label: 'Legal - Common Law' },
    { value: 'LEGAL_SHARIA', label: 'Legal - Sharia' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'ADMIN_HR', label: 'Admin & HR' },
    { value: 'RECORDS', label: 'Records' },
    { value: 'GUIDANCE_COUNSELING', label: 'Guidance & Counseling' }
  ]

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        console.error('No authentication token found')
        setError('No authentication token found. Please log in again.')
        setLoading(false)
        return
      }

      console.log('Fetching users with token:', token.substring(0, 20) + '...')
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Users data:', data)
        setUsers(data.data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch users:', errorData)
        alert(`Failed to fetch users: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert(`Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Create user
  const createUser = async (userData: CreateUserData) => {
    try {
      if (!token) {
        alert('No authentication token found. Please log in again.')
        return
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        setShowTempPassword(data.data.tempPassword)
        await fetchUsers()
        setShowCreateModal(false)
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: '',
          department: '',
          position: ''
        })
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  // Update user
  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        await fetchUsers()
        setShowEditModal(false)
        setEditingUser(null)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  // Reset password
  const resetPassword = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setShowTempPassword(data.data.tempPassword)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  // Handle role change
  const handleRoleChange = (role: string) => {
    const selectedRole = roleOptions.find(r => r.value === role)
    setFormData(prev => ({
      ...prev,
      role,
      department: selectedRole?.department || ''
    }))
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = !filterRole || user.role === filterRole
    const matchesDepartment = !filterDepartment || user.department === filterDepartment

    return matchesSearch && matchesRole && matchesDepartment
  })

  // Get role color
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
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  useEffect(() => {
    // Only fetch users if we have a valid token and are authenticated
    if (isAuthenticated && token) {
      fetchUsers()
    } else if (!isAuthenticated) {
      console.log('User not authenticated, ProtectedRoute should handle redirect')
      setError('Please log in to access this page.')
      setLoading(false)
    }
  }, [isAuthenticated, token])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage team members and their access permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
              <button
                onClick={fetchUsers}
                className="btn btn-secondary btn-md"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Filters */}
        <div className="card mb-8">
          <div className="card-content">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input"
                >
                  <option value="">All Roles</option>
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="input"
                >
                  <option value="">All Departments</option>
                  {departmentOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <p className="text-sm text-gray-600">{filteredUsers.length} users found</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-content p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
                <p className="text-gray-600 text-center mb-6">{error}</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="btn btn-primary btn-md"
                >
                  Go to Login
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 text-center mb-6">
                  {searchTerm || filterRole || filterDepartment 
                    ? 'No users match your current filters. Try adjusting your search criteria.'
                    : 'Get started by creating your first user account.'
                  }
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary btn-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{user.position || 'No position'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getRoleColor(user.role)}`}>
                            {user.role.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td>
                          <div className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200">
                            {user.department.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setShowEditModal(true)
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => resetPassword(user.id)}
                              className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="input"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="input"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="input"
                >
                  <option value="">Select a role</option>
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="input"
                  disabled={!!formData.role}
                >
                  <option value="">Select a department</option>
                  {departmentOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="input"
                  placeholder="Enter position title"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={() => createUser(formData)}
                className="btn btn-primary btn-md"
                disabled={!formData.email || !formData.firstName || !formData.lastName || !formData.role || !formData.department}
              >
                <Save className="w-4 h-4 mr-2" />
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    defaultValue={editingUser.firstName}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    defaultValue={editingUser.lastName}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  defaultValue={editingUser.email}
                  className="input"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={editingUser.phone || ''}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  defaultValue={editingUser.role}
                  className="input"
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select
                  defaultValue={editingUser.department}
                  className="input"
                >
                  {departmentOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Position</label>
                <input
                  type="text"
                  defaultValue={editingUser.position || ''}
                  className="input"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={editingUser.isActive}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active User
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implementation for update
                  setShowEditModal(false)
                }}
                className="btn btn-primary btn-md"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {showTempPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Temporary Password</h3>
                <button
                  onClick={() => setShowTempPassword(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">Important</p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Share this temporary password with the user. They must change it on their first login.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Temporary Password:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono">
                    {showTempPassword}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(showTempPassword)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTempPassword(null)}
                className="btn btn-primary btn-md"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
