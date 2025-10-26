import React from 'react'
import { 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  PieChart,
  Target,
  Briefcase,
  Scale,
  Gavel,
  FileCheck,
  UserCheck,
  Building2,
  Timer,
  Star,
  Award,
  Shield,
  Lock
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Clients',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'primary',
      trend: 'up'
    },
    {
      name: 'Active Cases',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
      color: 'success',
      trend: 'up'
    },
    {
      name: 'Monthly Revenue',
      value: '$45,230',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'warning',
      trend: 'up'
    },
    {
      name: 'Pending Invoices',
      value: '23',
      change: '-5%',
      changeType: 'negative',
      icon: Clock,
      color: 'error',
      trend: 'down'
    },
    {
      name: 'Success Rate',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
      icon: Target,
      color: 'success',
      trend: 'up'
    },
    {
      name: 'Team Efficiency',
      value: '87%',
      change: '+3%',
      changeType: 'positive',
      icon: Zap,
      color: 'primary',
      trend: 'up'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'case',
      description: 'New case filed: Johnson vs. Smith',
      time: '2 hours ago',
      icon: FileText,
      status: 'success'
    },
    {
      id: 2,
      type: 'client',
      description: 'Client meeting scheduled with ABC Corp',
      time: '4 hours ago',
      icon: Users,
      status: 'info'
    },
    {
      id: 3,
      type: 'invoice',
      description: 'Invoice #INV-2024-001 paid',
      time: '6 hours ago',
      icon: DollarSign,
      status: 'success'
    },
    {
      id: 4,
      type: 'document',
      description: 'Contract uploaded for Case #C-2024-045',
      time: '8 hours ago',
      icon: FileCheck,
      status: 'info'
    },
    {
      id: 5,
      type: 'deadline',
      description: 'Court filing deadline approaching',
      time: '12 hours ago',
      icon: AlertCircle,
      status: 'warning'
    }
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Court Hearing - Johnson vs. Smith',
      date: '2024-01-15',
      type: 'court',
      priority: 'high',
      icon: Gavel
    },
    {
      id: 2,
      title: 'Contract Review Deadline',
      date: '2024-01-18',
      type: 'deadline',
      priority: 'medium',
      icon: Timer
    },
    {
      id: 3,
      title: 'Client Meeting - ABC Corp',
      date: '2024-01-20',
      type: 'meeting',
      priority: 'low',
      icon: Calendar
    },
    {
      id: 4,
      title: 'Document Filing - Estate Case',
      date: '2024-01-22',
      type: 'filing',
      priority: 'high',
      icon: FileCheck
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-soft">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your practice overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn btn-secondary btn-md">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </button>
              <button className="btn btn-primary btn-md">
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="card animate-fade-in">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'primary' ? 'bg-blue-100' :
                    stat.color === 'success' ? 'bg-green-100' :
                    stat.color === 'warning' ? 'bg-yellow-100' :
                    stat.color === 'error' ? 'bg-red-100' :
                    'bg-neutral-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-blue-600' :
                      stat.color === 'success' ? 'text-green-600' :
                      stat.color === 'warning' ? 'text-yellow-600' :
                      stat.color === 'error' ? 'text-red-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="xl:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                      <p className="text-sm text-gray-600">Latest updates from your practice</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View All
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-neutral-100 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'success' ? 'bg-green-100' :
                        activity.status === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <activity.icon className={`w-4 h-4 ${
                          activity.status === 'success' ? 'text-green-600' :
                          activity.status === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-success-500' :
                        activity.status === 'warning' ? 'bg-warning-500' :
                        'bg-primary-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                    <p className="text-sm text-gray-600">Important dates ahead</p>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="p-4 border border-gray-200 rounded-xl hover:border-neutral-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          deadline.priority === 'high' ? 'bg-red-100' :
                          deadline.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-neutral-100'
                        }`}>
                          <deadline.icon className={`w-4 h-4 ${
                            deadline.priority === 'high' ? 'text-red-600' :
                            deadline.priority === 'medium' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">{deadline.title}</p>
                          <p className="text-xs text-neutral-500 mb-2">{deadline.date}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            deadline.priority === 'high' ? 'bg-red-100 text-error-800' :
                            deadline.priority === 'medium' ? 'bg-yellow-100 text-warning-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {deadline.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Frequently used functions</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">New Client</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <FileText className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">New Case</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <DollarSign className="w-6 h-6 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Create Invoice</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <FileCheck className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Upload Document</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <Calendar className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-neutral-100 rounded-xl transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
