import React from 'react'
import { Users, FileText, DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react'

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Clients',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Cases',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Monthly Revenue',
      value: '$45,230',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Pending Invoices',
      value: '23',
      change: '-5%',
      changeType: 'negative',
      icon: Clock,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'case',
      description: 'New case filed: Johnson vs. Smith',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'client',
      description: 'Client meeting scheduled with ABC Corp',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'invoice',
      description: 'Invoice #INV-2024-001 paid',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'document',
      description: 'Contract uploaded for Case #C-2024-045',
      time: '8 hours ago',
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Court Hearing - Johnson vs. Smith',
      date: '2024-01-15',
      type: 'court',
    },
    {
      id: 2,
      title: 'Contract Review Deadline',
      date: '2024-01-18',
      type: 'deadline',
    },
    {
      id: 3,
      title: 'Client Meeting - ABC Corp',
      date: '2024-01-20',
      type: 'meeting',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-xs text-gray-500">{deadline.date}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  deadline.type === 'court' 
                    ? 'bg-red-100 text-red-800'
                    : deadline.type === 'deadline'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {deadline.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
