import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Briefcase,
  FileText,
  Archive,
  Settings,
  BarChart3,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Building
} from 'lucide-react'

interface Case {
  id: string
  matterNumber: string // Unique, immutable after creation
  title: string // 4-150 chars; clickable to open matter
  description: string
  clientId: string
  clientName: string // If multiple clients, show "Bonny K. +1"
  responsibleAttorney: string // One primary attorney
  responsibleAttorneyName: string
  teamMembers: TeamMember[] // Show avatar stack (max 3) + "+n"
  practiceArea: string // From admin dictionary
  stage: string // From stage pipeline of the template
  status: 'ACTIVE' | 'PENDING' | 'CLOSED' | 'ARCHIVED' // Drives visibility & SLA rules
  nextKeyDate?: string // Auto-computed from calendar dates flagged as "key"
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' // Color badge
  createdAt: string // System set - "Opened On"
  billStatus: 'PENDING' | 'PAID' | 'OVERDUE' // Billing status
  updatedAt: string // Last Activity from activity feed
  note?: string // Notes field
  attachedFiles: number // Count of attached documents
  estimatedValue?: number
  actualValue?: number
}

interface TeamMember {
  id: string
  name: string
  avatar?: string
  role: string
}

const Cases: React.FC = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-cases' | 'my-cases' | 'archived' | 'templates' | 'reports'>('dashboard')
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterPracticeArea, setFilterPracticeArea] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterAttorney, setFilterAttorney] = useState<string[]>([])
  const [filterOpenedDateFrom, setFilterOpenedDateFrom] = useState('')
  const [filterOpenedDateTo, setFilterOpenedDateTo] = useState('')
  const [filterLastActivityFrom, setFilterLastActivityFrom] = useState('')
  const [filterLastActivityTo, setFilterLastActivityTo] = useState('')
  const [filterNextKeyDateFrom, setFilterNextKeyDateFrom] = useState('')
  const [filterNextKeyDateTo, setFilterNextKeyDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMatterPanel, setShowMatterPanel] = useState(false)
  const [showClientPanel, setShowClientPanel] = useState(false)
  const [selectedMatter, setSelectedMatter] = useState<Case | null>(null)
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string, email?: string, phone?: string} | null>(null)
  
  // Add New Case Form State
  const [newCaseForm, setNewCaseForm] = useState({
    // Client Information
    clientId: '',
    additionalClients: [] as string[],
    isNewClient: false,
    newClient: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    },
    
    // Basic Case Information
    title: '',
    description: '',
    matterNumber: '', // Auto-generated
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    practiceArea: '',
    stage: 'INITIAL_CONSULTATION',
    
    // Legal Team
    responsibleAttorney: '',
    assistingAttorneys: [] as string[],
    
    // Court Information
    jurisdiction: {
      country: '',
      district: '',
      division: '',
      county: '',
      village: ''
    },
    courtName: '',
    courtFile: '',
    hearingLocation: '',
    
    // Key Dates and Compliance
    openedOn: new Date().toISOString().split('T')[0],
    statuteOfLimitations: '',
    initialHearing: '',
    nextMilestone: '',
    reminderPreferences: [] as string[],
    notifyOn: [] as string[],
    notificationRecipients: [] as string[],
    
    // Related Contacts
    opposingParty: {
      name: '',
      organization: '',
      address: '',
      phone: '',
      email: ''
    },
    opposingCounsel: {
      name: '',
      firm: '',
      address: '',
      phone: '',
      email: ''
    },
    witnesses: [] as Array<{
      name: '',
      phone: '',
      email: '',
      address: ''
    }>,
    
    // Additional Fields
    estimatedValue: '',
    note: ''
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Activity Panel State
  const [isActivityPanelMinimized, setIsActivityPanelMinimized] = useState(false)
  const [activityPanelHeight, setActivityPanelHeight] = useState(400)
  
  // Mock activity data
  const recentActivities = [
    { id: 1, action: 'New case created', case: 'MAT-2024-001', time: '2 hours ago', user: 'Sarah Johnson', type: 'create' },
    { id: 2, action: 'Document uploaded', case: 'MAT-2024-002', time: '4 hours ago', user: 'Michael Brown', type: 'upload' },
    { id: 3, action: 'Case status updated', case: 'MAT-2024-003', time: '6 hours ago', user: 'Emily Davis', type: 'update' },
    { id: 4, action: 'Meeting scheduled', case: 'MAT-2024-004', time: '1 day ago', user: 'David Wilson', type: 'meeting' },
    { id: 5, action: 'Client contacted', case: 'MAT-2024-005', time: '2 days ago', user: 'Sarah Johnson', type: 'contact' },
    { id: 6, action: 'Deadline reminder', case: 'MAT-2024-001', time: '3 days ago', user: 'System', type: 'reminder' },
    { id: 7, action: 'Invoice generated', case: 'MAT-2024-002', time: '4 days ago', user: 'Michael Brown', type: 'invoice' },
    { id: 8, action: 'Case archived', case: 'MAT-2023-045', time: '1 week ago', user: 'Emily Davis', type: 'archive' }
  ]
  
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    matterNumber: true,
    title: true,
    clientName: true,
    responsibleAttorney: true,
    teamMembers: true,
    practiceArea: true,
    stage: true,
    status: true,
    nextKeyDate: true,
    priority: true,
    createdAt: true,
    billStatus: true,
    updatedAt: true,
    note: false,
    attachedFiles: true
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Set active tab based on current route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) {
      setActiveTab('dashboard')
    } else if (path.includes('/all-cases')) {
      setActiveTab('all-cases')
    } else if (path.includes('/my-cases')) {
      setActiveTab('my-cases')
    } else if (path.includes('/archived')) {
      setActiveTab('archived')
    } else if (path.includes('/templates')) {
      setActiveTab('templates')
    } else if (path.includes('/reports')) {
      setActiveTab('reports')
    } else {
      setActiveTab('dashboard') // Default to dashboard
    }
  }, [location.pathname])

  // Mock data for demonstration
  const mockCases: Case[] = [
    {
      id: '1',
      matterNumber: 'MAT-2024-001',
      title: 'Contract Dispute Resolution',
      description: 'Commercial contract dispute between ABC Corp and XYZ Ltd',
      clientId: 'client-1',
      clientName: 'ABC Corporation',
      responsibleAttorney: user?.id || '',
      responsibleAttorneyName: `${user?.firstName} ${user?.lastName}`,
      teamMembers: [
        { id: 'tm1', name: 'Sarah Wilson', role: 'Senior Associate', avatar: 'SW' },
        { id: 'tm2', name: 'Michael Brown', role: 'Junior Associate', avatar: 'MB' },
        { id: 'tm3', name: 'Lisa Garcia', role: 'Legal Assistant', avatar: 'LG' }
      ],
      practiceArea: 'Commercial Law',
      stage: 'Discovery',
      status: 'ACTIVE',
      nextKeyDate: '2024-03-15',
      priority: 'HIGH',
      createdAt: '2024-01-15',
      billStatus: 'PENDING',
      updatedAt: '2024-01-20',
      note: 'Initial client meeting completed. Discovery phase initiated.',
      attachedFiles: 12,
      estimatedValue: 50000,
      actualValue: 0
    },
    {
      id: '2',
      matterNumber: 'MAT-2024-002',
      title: 'Employment Law Matter',
      description: 'Wrongful termination case',
      clientId: 'client-2',
      clientName: 'John Smith',
      responsibleAttorney: user?.id || '',
      responsibleAttorneyName: `${user?.firstName} ${user?.lastName}`,
      teamMembers: [
        { id: 'tm4', name: 'David Miller', role: 'Associate', avatar: 'DM' }
      ],
      practiceArea: 'Employment Law',
      stage: 'Initial Consultation',
      status: 'PENDING',
      nextKeyDate: '2024-04-01',
      priority: 'MEDIUM',
      createdAt: '2024-01-18',
      billStatus: 'PENDING',
      updatedAt: '2024-01-22',
      note: 'Client consultation scheduled for next week.',
      attachedFiles: 5,
      estimatedValue: 25000,
      actualValue: 0
    },
    {
      id: '3',
      matterNumber: 'MAT-2024-003',
      title: 'Property Transaction',
      description: 'Real estate purchase agreement review',
      clientId: 'client-3',
      clientName: 'Mary Johnson',
      responsibleAttorney: user?.id || '',
      responsibleAttorneyName: `${user?.firstName} ${user?.lastName}`,
      teamMembers: [
        { id: 'tm5', name: 'Jennifer Lee', role: 'Senior Associate', avatar: 'JL' },
        { id: 'tm6', name: 'Robert Davis', role: 'Junior Associate', avatar: 'RD' }
      ],
      practiceArea: 'Property Law',
      stage: 'Closing',
      status: 'CLOSED',
      nextKeyDate: '2024-02-15',
      priority: 'LOW',
      createdAt: '2024-01-10',
      billStatus: 'PAID',
      updatedAt: '2024-01-25',
      note: 'Transaction completed successfully. All documents filed.',
      attachedFiles: 8,
      estimatedValue: 15000,
      actualValue: 15000
    },
    {
      id: '4',
      matterNumber: 'MAT-2024-004',
      title: 'Family Law Dispute',
      description: 'Divorce proceedings and asset division',
      clientId: 'client-4',
      clientName: 'Robert Davis',
      responsibleAttorney: 'user-2',
      responsibleAttorneyName: 'Sarah Wilson',
      teamMembers: [
        { id: 'tm7', name: 'Sarah Wilson', role: 'Senior Associate', avatar: 'SW' },
        { id: 'tm8', name: 'Michael Brown', role: 'Associate', avatar: 'MB' }
      ],
      practiceArea: 'Family Law',
      stage: 'Mediation',
      status: 'ACTIVE',
      nextKeyDate: '2024-05-01',
      priority: 'HIGH',
      createdAt: '2024-01-20',
      billStatus: 'OVERDUE',
      updatedAt: '2024-01-25',
      note: 'Mediation session scheduled. Asset valuation in progress.',
      attachedFiles: 15,
      estimatedValue: 35000,
      actualValue: 0
    },
    {
      id: '5',
      matterNumber: 'MAT-2024-005',
      title: 'Criminal Defense',
      description: 'White-collar crime defense',
      clientId: 'client-5',
      clientName: 'Tech Solutions Inc',
      responsibleAttorney: 'user-3',
      responsibleAttorneyName: 'Michael Brown',
      teamMembers: [
        { id: 'tm9', name: 'Michael Brown', role: 'Senior Associate', avatar: 'MB' },
        { id: 'tm10', name: 'Lisa Garcia', role: 'Legal Assistant', avatar: 'LG' },
        { id: 'tm11', name: 'David Miller', role: 'Junior Associate', avatar: 'DM' },
        { id: 'tm12', name: 'Jennifer Lee', role: 'Paralegal', avatar: 'JL' }
      ],
      practiceArea: 'Criminal Law',
      stage: 'Pre-Trial',
      status: 'PENDING',
      nextKeyDate: '2024-03-01',
      priority: 'URGENT',
      createdAt: '2024-01-22',
      billStatus: 'PENDING',
      updatedAt: '2024-01-26',
      note: 'Evidence review in progress. Expert witness consultation scheduled.',
      attachedFiles: 25,
      estimatedValue: 75000,
      actualValue: 0
    },
    {
      id: '6',
      matterNumber: 'MAT-2024-006',
      title: 'Intellectual Property',
      description: 'Patent infringement case',
      clientId: 'client-6',
      clientName: 'Innovation Labs',
      responsibleAttorney: user?.id || '',
      responsibleAttorneyName: `${user?.firstName} ${user?.lastName}`,
      teamMembers: [
        { id: 'tm13', name: 'Sarah Wilson', role: 'Senior Associate', avatar: 'SW' },
        { id: 'tm14', name: 'Robert Davis', role: 'Associate', avatar: 'RD' }
      ],
      practiceArea: 'Intellectual Property Law',
      stage: 'Litigation',
      status: 'ACTIVE',
      nextKeyDate: '2024-06-15',
      priority: 'MEDIUM',
      createdAt: '2024-01-25',
      billStatus: 'PAID',
      updatedAt: '2024-01-28',
      note: 'Patent analysis completed. Infringement case filed.',
      attachedFiles: 18,
      estimatedValue: 100000,
      actualValue: 0
    },
    {
      id: '7',
      matterNumber: 'MAT-2024-007',
      title: 'Corporate Merger',
      description: 'Due diligence for corporate merger',
      clientId: 'client-7',
      clientName: 'Global Enterprises',
      responsibleAttorney: 'user-4',
      responsibleAttorneyName: 'Jennifer Lee',
      teamMembers: [
        { id: 'tm15', name: 'Jennifer Lee', role: 'Senior Associate', avatar: 'JL' },
        { id: 'tm16', name: 'David Miller', role: 'Associate', avatar: 'DM' },
        { id: 'tm17', name: 'Lisa Garcia', role: 'Legal Assistant', avatar: 'LG' }
      ],
      practiceArea: 'Corporate Law',
      stage: 'Due Diligence',
      status: 'CLOSED',
      nextKeyDate: '2024-02-28',
      priority: 'HIGH',
      createdAt: '2024-01-12',
      billStatus: 'PAID',
      updatedAt: '2024-01-30',
      note: 'Merger completed successfully. All regulatory approvals obtained.',
      attachedFiles: 32,
      estimatedValue: 200000,
      actualValue: 200000
    },
    {
      id: '8',
      matterNumber: 'MAT-2024-008',
      title: 'Personal Injury',
      description: 'Motor vehicle accident claim',
      clientId: 'client-8',
      clientName: 'David Miller',
      responsibleAttorney: 'user-5',
      responsibleAttorneyName: 'Lisa Garcia',
      teamMembers: [
        { id: 'tm18', name: 'Lisa Garcia', role: 'Associate', avatar: 'LG' },
        { id: 'tm19', name: 'Michael Brown', role: 'Junior Associate', avatar: 'MB' }
      ],
      practiceArea: 'Personal Injury Law',
      stage: 'Settlement Negotiation',
      status: 'PENDING',
      nextKeyDate: '2024-04-15',
      priority: 'MEDIUM',
      createdAt: '2024-01-28',
      billStatus: 'PENDING',
      updatedAt: '2024-01-30',
      note: 'Settlement negotiations ongoing. Medical reports under review.',
      attachedFiles: 7,
      estimatedValue: 45000,
      actualValue: 0
    }
  ]

  // Initialize cases with mock data
  useEffect(() => {
    setCases(mockCases)
  }, [])

  // Get unique values for filters
  const getUniqueStages = () => {
    const stages = [...new Set(cases.map(case_ => case_.stage))]
    return stages.sort()
  }

  const getUniqueAttorneys = () => {
    const attorneys = new Set<string>()
    cases.forEach(case_ => {
      attorneys.add(case_.responsibleAttorneyName)
      case_.teamMembers.forEach(member => attorneys.add(member.name))
    })
    return Array.from(attorneys).sort()
  }

  const handleAttorneyToggle = (attorneyName: string) => {
    setFilterAttorney(prev => 
      prev.includes(attorneyName) 
        ? prev.filter(name => name !== attorneyName)
        : [...prev, attorneyName]
    )
  }

  const clearAllFilters = () => {
    setFilterStatus('')
    setFilterPriority('')
    setFilterPracticeArea('')
    setFilterStage('')
    setFilterAttorney([])
    setFilterOpenedDateFrom('')
    setFilterOpenedDateTo('')
    setFilterLastActivityFrom('')
    setFilterLastActivityTo('')
    setFilterNextKeyDateFrom('')
    setFilterNextKeyDateTo('')
  }

  // Side panel handlers
  const handleMatterClick = (matter: Case) => {
    setSelectedMatter(matter)
    setShowMatterPanel(true)
  }

  const handleClientClick = (clientId: string, clientName: string) => {
    // Mock client data - in real app, this would come from API
    const mockClient = {
      id: clientId,
      name: clientName,
      email: `${clientName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: '+1 (555) 123-4567'
    }
    setSelectedClient(mockClient)
    setShowClientPanel(true)
  }

  const closeSidePanels = () => {
    setShowMatterPanel(false)
    setShowClientPanel(false)
    setSelectedMatter(null)
    setSelectedClient(null)
  }

  // Form handlers
  const handleFormChange = (field: string, value: any) => {
    setNewCaseForm(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleNestedFormChange = (parentField: string, childField: string, value: any) => {
    setNewCaseForm(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [childField]: value
      }
    }))
  }

  const generateMatterNumber = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `MAT-${year}-${randomNum}`
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Required fields validation
    if (!newCaseForm.clientId && !newCaseForm.isNewClient) {
      errors.clientId = 'Please select a client or create a new one'
    }
    
    if (newCaseForm.isNewClient) {
      if (!newCaseForm.newClient.firstName) errors['newClient.firstName'] = 'First name is required'
      if (!newCaseForm.newClient.lastName) errors['newClient.lastName'] = 'Last name is required'
      if (!newCaseForm.newClient.email) errors['newClient.email'] = 'Email is required'
    }
    
    if (!newCaseForm.title) errors.title = 'Case title is required'
    if (newCaseForm.title.length < 4) errors.title = 'Title must be at least 4 characters'
    if (newCaseForm.title.length > 150) errors.title = 'Title must be less than 150 characters'
    
    if (!newCaseForm.responsibleAttorney) errors.responsibleAttorney = 'Responsible attorney is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Generate matter number if not set
      const matterNumber = newCaseForm.matterNumber || generateMatterNumber()
      
      // Create case data
      const caseData = {
        ...newCaseForm,
        matterNumber,
        id: `case-${Date.now()}`,
        clientName: newCaseForm.isNewClient 
          ? `${newCaseForm.newClient.firstName} ${newCaseForm.newClient.lastName}`
          : 'Selected Client', // Would be resolved from clientId
        responsibleAttorneyName: 'Selected Attorney', // Would be resolved from responsibleAttorney
        teamMembers: [], // Would be populated from assistingAttorneys
        status: 'ACTIVE' as const,
        createdAt: newCaseForm.openedOn,
        updatedAt: new Date().toISOString(),
        attachedFiles: 0
      }
      
      // Add to cases list
      setCases(prev => [caseData, ...prev])
      
      // Reset form
      setNewCaseForm({
        clientId: '',
        additionalClients: [],
        isNewClient: false,
        newClient: { firstName: '', lastName: '', email: '', phone: '', address: '' },
        title: '',
        description: '',
        matterNumber: '',
        priority: 'MEDIUM',
        practiceArea: '',
        stage: 'INITIAL_CONSULTATION',
        responsibleAttorney: '',
        assistingAttorneys: [],
        jurisdiction: { country: '', district: '', division: '', county: '', village: '' },
        courtName: '',
        courtFile: '',
        hearingLocation: '',
        openedOn: new Date().toISOString().split('T')[0],
        statuteOfLimitations: '',
        initialHearing: '',
        nextMilestone: '',
        reminderPreferences: [],
        notifyOn: [],
        notificationRecipients: [],
        opposingParty: { name: '', organization: '', address: '', phone: '', email: '' },
        opposingCounsel: { name: '', firm: '', address: '', phone: '', email: '' },
        witnesses: [],
        estimatedValue: '',
        note: ''
      })
      
      setShowCreateModal(false)
      setFormErrors({})
      
    } catch (error) {
      console.error('Error creating case:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewCaseForm({
      clientId: '',
      additionalClients: [],
      isNewClient: false,
      newClient: { firstName: '', lastName: '', email: '', phone: '', address: '' },
      title: '',
      description: '',
      matterNumber: '',
      priority: 'MEDIUM',
      practiceArea: '',
      stage: 'INITIAL_CONSULTATION',
      responsibleAttorney: '',
      assistingAttorneys: [],
      jurisdiction: { country: '', district: '', division: '', county: '', village: '' },
      courtName: '',
      courtFile: '',
      hearingLocation: '',
      openedOn: new Date().toISOString().split('T')[0],
      statuteOfLimitations: '',
      initialHearing: '',
      nextMilestone: '',
      reminderPreferences: [],
      notifyOn: [],
      notificationRecipients: [],
      opposingParty: { name: '', organization: '', address: '', phone: '', email: '' },
      opposingCounsel: { name: '', firm: '', address: '', phone: '', email: '' },
      witnesses: [],
      estimatedValue: '',
      note: ''
    })
    setFormErrors({})
  }

  // Filter cases based on search and filters
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.responsibleAttorneyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || case_.status === filterStatus
    const matchesPriority = !filterPriority || case_.priority === filterPriority
    const matchesPracticeArea = !filterPracticeArea || case_.practiceArea === filterPracticeArea
    const matchesStage = !filterStage || case_.stage === filterStage
    
    // Attorney/Team Member filter (multi-select)
    const matchesAttorney = filterAttorney.length === 0 || 
      filterAttorney.includes(case_.responsibleAttorneyName) ||
      case_.teamMembers.some(member => filterAttorney.includes(member.name))
    
    // Date range filters
    const caseOpenedDate = new Date(case_.createdAt)
    const caseLastActivityDate = new Date(case_.updatedAt)
    const caseNextKeyDate = case_.nextKeyDate ? new Date(case_.nextKeyDate) : null
    
    const matchesOpenedDate = (!filterOpenedDateFrom || caseOpenedDate >= new Date(filterOpenedDateFrom)) &&
                             (!filterOpenedDateTo || caseOpenedDate <= new Date(filterOpenedDateTo))
    
    const matchesLastActivity = (!filterLastActivityFrom || caseLastActivityDate >= new Date(filterLastActivityFrom)) &&
                               (!filterLastActivityTo || caseLastActivityDate <= new Date(filterLastActivityTo))
    
    const matchesNextKeyDate = (!filterNextKeyDateFrom || !caseNextKeyDate || caseNextKeyDate >= new Date(filterNextKeyDateFrom)) &&
                              (!filterNextKeyDateTo || !caseNextKeyDate || caseNextKeyDate <= new Date(filterNextKeyDateTo))

    return matchesSearch && matchesStatus && matchesPriority && matchesPracticeArea && 
           matchesStage && matchesAttorney && matchesOpenedDate && matchesLastActivity && matchesNextKeyDate
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCases = filteredCases.slice(startIndex, endIndex)

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedCases.length === paginatedCases.length) {
      setSelectedCases([])
    } else {
      setSelectedCases(paginatedCases.map(case_ => case_.id))
    }
  }

  const handleSelectCase = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on cases:`, selectedCases)
    // Implement bulk actions here
    setSelectedCases([])
    setShowBulkActions(false)
  }

  const handleExport = (format: 'excel' | 'pdf') => {
    console.log(`Exporting cases as ${format}`)
    // Implement export functionality here
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CLOSED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Tab configuration
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Case overview and key metrics'
    },
    {
      id: 'all-cases',
      label: 'All Cases',
      icon: Briefcase,
      description: 'Master list of all cases in the firm'
    },
    {
      id: 'my-cases',
      label: 'My Cases',
      icon: Briefcase,
      description: 'Your active and pending cases'
    },
    {
      id: 'archived',
      label: 'Archived Cases',
      icon: Archive,
      description: 'Closed and archived cases'
    },
    {
      id: 'templates',
      label: 'Case Templates',
      icon: Settings,
      description: 'Manage case forms and templates',
      adminOnly: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      description: 'Case analytics and reports'
    }
  ]

  // Filter tabs based on user permissions
  const availableTabs = tabs.filter(tab => {
    if (tab.adminOnly) {
      return user?.permissions?.canManageSettings || user?.role === 'MANAGING_PARTNER_CEO'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legal Operations</h1>
                <p className="text-sm text-gray-600">Case Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cases Dashboard</h3>
                    <p className="text-sm text-gray-600">Overview of case metrics and activities</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Cases</p>
                        <p className="text-3xl font-bold">{cases.length}</p>
                        <p className="text-blue-100 text-sm">+12% from last month</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Active Cases</p>
                        <p className="text-3xl font-bold">{cases.filter(c => c.status === 'ACTIVE').length}</p>
                        <p className="text-green-100 text-sm">Currently in progress</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Pending Cases</p>
                        <p className="text-3xl font-bold">{cases.filter(c => c.status === 'PENDING').length}</p>
                        <p className="text-yellow-100 text-sm">Awaiting action</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Closed Cases</p>
                        <p className="text-3xl font-bold">{cases.filter(c => c.status === 'CLOSED').length}</p>
                        <p className="text-purple-100 text-sm">Successfully resolved</p>
                      </div>
                      <Archive className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Practice Area Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Practice Area Distribution</h4>
                    <div className="space-y-3">
                      {['FAMILY', 'LAND', 'SHARIA_FAMILY', 'COMMERCIAL', 'CRIMINAL', 'CIVIL'].map((area) => {
                        const count = cases.filter(c => c.practiceArea === area).length
                        const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0
                        return (
                          <div key={area} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{area.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Attorney Workload */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Attorney Workload</h4>
                    <div className="space-y-3">
                      {['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'].map((attorney) => {
                        const count = cases.filter(c => c.responsibleAttorneyName === attorney).length
                        return (
                          <div key={attorney} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{attorney}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h4>
                  <div className="space-y-4">
                    {[
                      { case: 'MAT-2024-001', deadline: 'Court Filing', date: 'Tomorrow', priority: 'HIGH' },
                      { case: 'MAT-2024-002', deadline: 'Client Meeting', date: 'In 2 days', priority: 'MEDIUM' },
                      { case: 'MAT-2024-003', deadline: 'Document Review', date: 'In 3 days', priority: 'LOW' },
                      { case: 'MAT-2024-004', deadline: 'Statute of Limitations', date: 'In 5 days', priority: 'URGENT' },
                      { case: 'MAT-2024-005', deadline: 'Hearing Preparation', date: 'In 1 week', priority: 'HIGH' }
                    ].map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deadline.deadline}</p>
                          <p className="text-xs text-gray-500">{deadline.case}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{deadline.date}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            deadline.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            deadline.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            deadline.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {deadline.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-cases' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Action Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Cases</h3>
                    <p className="text-sm text-gray-600">{filteredCases.length} cases found</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Column Settings */}
                  <button
                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Columns
                  </button>
                  
                  {/* Export */}
                  <div className="relative">
                    <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                  
                  {/* New Case */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                  </button>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedCases.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedCases.length} case{selectedCases.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBulkAction('assign')}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleBulkAction('archive')}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedCases([])}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column Settings Modal */}
            {showColumnSettings && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Customize Columns</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setVisibleColumns(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Cases Table */}
            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading cases...</span>
                </div>
              ) : paginatedCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {searchTerm || filterStatus || filterPriority || filterPracticeArea
                      ? 'No cases match your current filters. Try adjusting your search criteria.'
                      : 'Get started by creating your first case.'
                    }
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Case
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedCases.length === paginatedCases.length && paginatedCases.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        {visibleColumns.matterNumber && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matter #
                          </th>
                        )}
                        {visibleColumns.title && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Case/Matter Title
                          </th>
                        )}
                        {visibleColumns.clientName && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                        )}
                        {visibleColumns.responsibleAttorney && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsible Attorney
                          </th>
                        )}
                        {visibleColumns.teamMembers && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team
                          </th>
                        )}
                        {visibleColumns.practiceArea && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Practice Area
                          </th>
                        )}
                        {visibleColumns.stage && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stage
                          </th>
                        )}
                        {visibleColumns.status && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        )}
                        {visibleColumns.nextKeyDate && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Next Deadline/Hearing
                          </th>
                        )}
                        {visibleColumns.priority && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                        )}
                        {visibleColumns.createdAt && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Opened On
                          </th>
                        )}
                        {visibleColumns.billStatus && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Billing Status
                          </th>
                        )}
                        {visibleColumns.updatedAt && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
                          </th>
                        )}
                        {visibleColumns.note && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        )}
                        {visibleColumns.attachedFiles && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attached Documents
                          </th>
                        )}
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedCases.map((case_) => (
                        <tr key={case_.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCases.includes(case_.id)}
                              onChange={() => handleSelectCase(case_.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          {visibleColumns.matterNumber && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleMatterClick(case_)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                {case_.matterNumber}
                              </button>
                            </td>
                          )}
                          {visibleColumns.title && (
                            <td className="px-3 py-3">
                              <div>
                                <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                                  {case_.title}
                                </div>
                                <div className="text-sm text-gray-500">{case_.description}</div>
                              </div>
                            </td>
                          )}
                          {visibleColumns.clientName && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                <button
                                  onClick={() => handleClientClick(case_.clientId, case_.clientName)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                  {case_.clientName}
                                </button>
                              </div>
                            </td>
                          )}
                          {visibleColumns.responsibleAttorney && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                              {case_.responsibleAttorneyName}
                            </td>
                          )}
                          {visibleColumns.teamMembers && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center -space-x-2">
                                {case_.teamMembers.slice(0, 3).map((member, index) => (
                                  <div
                                    key={member.id}
                                    className="w-8 h-8 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white"
                                    title={`${member.name} - ${member.role}`}
                                  >
                                    {member.avatar}
                                  </div>
                                ))}
                                {case_.teamMembers.length > 3 && (
                                  <div className="w-8 h-8 bg-gray-300 text-gray-700 text-xs rounded-full flex items-center justify-center border-2 border-white">
                                    +{case_.teamMembers.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                          {visibleColumns.practiceArea && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                              {case_.practiceArea}
                            </td>
                          )}
                          {visibleColumns.stage && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {case_.stage}
                              </span>
                            </td>
                          )}
                          {visibleColumns.status && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(case_.status)}`}>
                                {case_.status}
                              </span>
                            </td>
                          )}
                          {visibleColumns.nextKeyDate && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {case_.nextKeyDate ? new Date(case_.nextKeyDate).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.priority && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(case_.priority)}`}>
                                {case_.priority}
                              </span>
                            </td>
                          )}
                          {visibleColumns.createdAt && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                              {new Date(case_.createdAt).toLocaleDateString()}
                            </td>
                          )}
                          {visibleColumns.billStatus && (
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                case_.billStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                case_.billStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {case_.billStatus}
                              </span>
                            </td>
                          )}
                          {visibleColumns.updatedAt && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                              {new Date(case_.updatedAt).toLocaleDateString()}
                            </td>
                          )}
                          {visibleColumns.note && (
                            <td className="px-3 py-3">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={case_.note}>
                                {case_.note || 'No notes'}
                              </div>
                            </td>
                          )}
                          {visibleColumns.attachedFiles && (
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{case_.attachedFiles}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCases.length)} of {filteredCases.length} cases
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-cases' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Cases</h3>
                    <p className="text-sm text-gray-600">{filteredCases.length} cases found</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading cases...</span>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {searchTerm || filterStatus || filterPriority || filterPracticeArea
                      ? 'No cases match your current filters. Try adjusting your search criteria.'
                      : 'Get started by creating your first case.'
                    }
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Case
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Case Details</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Practice Area</th>
                        <th>Due Date</th>
                        <th>Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((case_) => (
                        <tr key={case_.id}>
                          <td>
                            <div>
                              <div className="font-medium text-gray-900">{case_.title}</div>
                              <div className="text-sm text-gray-500">{case_.caseNumber}</div>
                              <div className="text-sm text-gray-600 mt-1">{case_.description}</div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{case_.clientName}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusColor(case_.status)}`}>
                              {case_.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityColor(case_.priority)}`}>
                              {case_.priority}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-gray-900">{case_.practiceArea}</span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {case_.dueDate ? new Date(case_.dueDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="text-sm text-gray-900">
                              {case_.estimatedValue ? `$${case_.estimatedValue.toLocaleString()}` : 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
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
        )}

        {activeTab === 'archived' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Archive className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Archived Cases</h3>
                  <p className="text-sm text-gray-600">Closed and archived cases</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No archived cases</h3>
                <p className="text-gray-600 text-center">
                  Archived cases will appear here once cases are closed and archived.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Case Templates</h3>
                  <p className="text-sm text-gray-600">Manage case forms and templates</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Management</h3>
                <p className="text-gray-600 text-center mb-6">
                  Create and manage custom forms for different case types, client onboarding, and employee management.
                </p>
                <div className="flex space-x-4">
                  <button className="btn btn-primary btn-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </button>
                  <button className="btn btn-secondary btn-md">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Case Reports</h3>
                  <p className="text-sm text-gray-600">Analytics and insights about your cases</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Cases</p>
                      <p className="text-2xl font-bold text-blue-900">24</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Active Cases</p>
                      <p className="text-2xl font-bold text-green-900">18</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Pending Cases</p>
                      <p className="text-2xl font-bold text-yellow-900">6</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Total Value</p>
                      <p className="text-2xl font-bold text-purple-900">$125K</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                <p className="text-gray-600 text-center mb-6">
                  Generate comprehensive reports about case performance, client satisfaction, and financial metrics.
                </p>
                <div className="flex space-x-4">
                  <button className="btn btn-primary btn-md">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </button>
                  <button className="btn btn-secondary btn-md">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Case Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
            <div className="absolute inset-4 bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Add New Case</h3>
                      <p className="text-sm text-gray-600">Create a new case with comprehensive details</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Client Information Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Client Information
                      </h4>
                      
                      {/* Client Selection Toggle */}
                      <div className="mb-6">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleFormChange('isNewClient', false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              !newCaseForm.isNewClient 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Select Existing Client
                          </button>
                          <button
                            onClick={() => handleFormChange('isNewClient', true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              newCaseForm.isNewClient 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Create New Client
                          </button>
                        </div>
                      </div>

                      {!newCaseForm.isNewClient ? (
                        /* Existing Client Selection */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Client <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={newCaseForm.clientId}
                              onChange={(e) => handleFormChange('clientId', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formErrors.clientId ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select a client...</option>
                              <option value="client-1">John Smith</option>
                              <option value="client-2">Sarah Johnson</option>
                              <option value="client-3">ABC Corporation</option>
                              <option value="client-4">Mary Williams</option>
                            </select>
                            {formErrors.clientId && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.clientId}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Clients
                            </label>
                            <select
                              multiple
                              value={newCaseForm.additionalClients}
                              onChange={(e) => handleFormChange('additionalClients', Array.from(e.target.selectedOptions, option => option.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="client-1">John Smith</option>
                              <option value="client-2">Sarah Johnson</option>
                              <option value="client-3">ABC Corporation</option>
                              <option value="client-4">Mary Williams</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple clients</p>
                          </div>
                        </div>
                      ) : (
                        /* New Client Form */
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={newCaseForm.newClient.firstName}
                                onChange={(e) => handleNestedFormChange('newClient', 'firstName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  formErrors['newClient.firstName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter first name"
                              />
                              {formErrors['newClient.firstName'] && (
                                <p className="text-red-500 text-sm mt-1">{formErrors['newClient.firstName']}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={newCaseForm.newClient.lastName}
                                onChange={(e) => handleNestedFormChange('newClient', 'lastName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  formErrors['newClient.lastName'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter last name"
                              />
                              {formErrors['newClient.lastName'] && (
                                <p className="text-red-500 text-sm mt-1">{formErrors['newClient.lastName']}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={newCaseForm.newClient.email}
                                onChange={(e) => handleNestedFormChange('newClient', 'email', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  formErrors['newClient.email'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter email address"
                              />
                              {formErrors['newClient.email'] && (
                                <p className="text-red-500 text-sm mt-1">{formErrors['newClient.email']}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={newCaseForm.newClient.phone}
                                onChange={(e) => handleNestedFormChange('newClient', 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter phone number"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address
                            </label>
                            <textarea
                              value={newCaseForm.newClient.address}
                              onChange={(e) => handleNestedFormChange('newClient', 'address', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter full address"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Basic Case Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Basic Case Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Case Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCaseForm.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Amani v. Lakeview Ltd."
                            maxLength={150}
                          />
                          <p className="text-xs text-gray-500 mt-1">{newCaseForm.title.length}/150 characters</p>
                          {formErrors.title && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newCaseForm.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Freeform summary of the case..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Matter Number
                            </label>
                            <input
                              type="text"
                              value={newCaseForm.matterNumber || generateMatterNumber()}
                              onChange={(e) => handleFormChange('matterNumber', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Auto-generated"
                            />
                            <p className="text-xs text-gray-500 mt-1">Autogenerated format</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Priority
                            </label>
                            <select
                              value={newCaseForm.priority}
                              onChange={(e) => handleFormChange('priority', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Normal</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Practice Area
                            </label>
                            <select
                              value={newCaseForm.practiceArea}
                              onChange={(e) => handleFormChange('practiceArea', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select practice area...</option>
                              <option value="FAMILY">Family Law</option>
                              <option value="LAND">Land Law</option>
                              <option value="SHARIA_FAMILY">Sharia Family</option>
                              <option value="COMMERCIAL">Commercial Law</option>
                              <option value="CRIMINAL">Criminal Law</option>
                              <option value="CIVIL">Civil Law</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legal Team */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Legal Team
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Responsible Attorney <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newCaseForm.responsibleAttorney}
                            onChange={(e) => handleFormChange('responsibleAttorney', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.responsibleAttorney ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select responsible attorney...</option>
                            <option value="attorney-1">Sarah Johnson</option>
                            <option value="attorney-2">Michael Brown</option>
                            <option value="attorney-3">Emily Davis</option>
                            <option value="attorney-4">David Wilson</option>
                          </select>
                          {formErrors.responsibleAttorney && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.responsibleAttorney}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assisting Attorneys
                          </label>
                          <select
                            multiple
                            value={newCaseForm.assistingAttorneys}
                            onChange={(e) => handleFormChange('assistingAttorneys', Array.from(e.target.selectedOptions, option => option.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="attorney-1">Sarah Johnson</option>
                            <option value="attorney-2">Michael Brown</option>
                            <option value="attorney-3">Emily Davis</option>
                            <option value="attorney-4">David Wilson</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple attorneys</p>
                        </div>
                      </div>
                    </div>

                    {/* Court Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                        Court Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jurisdiction
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            <select
                              value={newCaseForm.jurisdiction.country}
                              onChange={(e) => handleNestedFormChange('jurisdiction', 'country', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Country</option>
                              <option value="UG">Uganda</option>
                              <option value="KE">Kenya</option>
                              <option value="TZ">Tanzania</option>
                            </select>
                            <select
                              value={newCaseForm.jurisdiction.district}
                              onChange={(e) => handleNestedFormChange('jurisdiction', 'district', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">District</option>
                              <option value="kampala">Kampala</option>
                              <option value="wakiso">Wakiso</option>
                              <option value="mukono">Mukono</option>
                            </select>
                            <select
                              value={newCaseForm.jurisdiction.division}
                              onChange={(e) => handleNestedFormChange('jurisdiction', 'division', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Division</option>
                              <option value="central">Central</option>
                              <option value="north">North</option>
                              <option value="south">South</option>
                            </select>
                            <select
                              value={newCaseForm.jurisdiction.county}
                              onChange={(e) => handleNestedFormChange('jurisdiction', 'county', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">County</option>
                              <option value="nakawa">Nakawa</option>
                              <option value="makindye">Makindye</option>
                              <option value="rubaga">Rubaga</option>
                            </select>
                            <select
                              value={newCaseForm.jurisdiction.village}
                              onChange={(e) => handleNestedFormChange('jurisdiction', 'village', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Village</option>
                              <option value="kololo">Kololo</option>
                              <option value="nakasero">Nakasero</option>
                              <option value="bugolobi">Bugolobi</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Court Name
                            </label>
                            <input
                              type="text"
                              value={newCaseForm.courtName}
                              onChange={(e) => handleFormChange('courtName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter court name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Court File
                            </label>
                            <input
                              type="text"
                              value={newCaseForm.courtFile}
                              onChange={(e) => handleFormChange('courtFile', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter court file number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hearing Location
                            </label>
                            <input
                              type="text"
                              value={newCaseForm.hearingLocation}
                              onChange={(e) => handleFormChange('hearingLocation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter hearing location"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Dates and Compliance */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Key Dates and Compliance
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Opened On
                            </label>
                            <input
                              type="date"
                              value={newCaseForm.openedOn}
                              onChange={(e) => handleFormChange('openedOn', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Defaults to today</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Statute of Limitations (SOL)
                            </label>
                            <input
                              type="date"
                              value={newCaseForm.statuteOfLimitations}
                              onChange={(e) => handleFormChange('statuteOfLimitations', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-create reminders (90/60/30/7 days)</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Initial Hearing / Next Milestone
                            </label>
                            <input
                              type="date"
                              value={newCaseForm.initialHearing}
                              onChange={(e) => handleFormChange('initialHearing', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Creates calendar event</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Next Milestone
                            </label>
                            <input
                              type="date"
                              value={newCaseForm.nextMilestone}
                              onChange={(e) => handleFormChange('nextMilestone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reminder Preferences
                          </label>
                          <div className="flex space-x-4">
                            {['Email', 'In-app', 'SMS'].map((pref) => (
                              <label key={pref} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newCaseForm.reminderPreferences.includes(pref)}
                                  onChange={(e) => {
                                    const newPrefs = e.target.checked
                                      ? [...newCaseForm.reminderPreferences, pref]
                                      : newCaseForm.reminderPreferences.filter(p => p !== pref)
                                    handleFormChange('reminderPreferences', newPrefs)
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{pref}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notify On
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['New docs', 'Time entries', 'Stage change', 'Approaching deadlines'].map((event) => (
                              <label key={event} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newCaseForm.notifyOn.includes(event)}
                                  onChange={(e) => {
                                    const newEvents = e.target.checked
                                      ? [...newCaseForm.notifyOn, event]
                                      : newCaseForm.notifyOn.filter(e => e !== event)
                                    handleFormChange('notifyOn', newEvents)
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{event}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Contacts */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Related Contacts
                      </h4>
                      
                      <div className="space-y-6">
                        {/* Opposing Party */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Opposing Party</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                              <input
                                type="text"
                                value={newCaseForm.opposingParty.name}
                                onChange={(e) => handleNestedFormChange('opposingParty', 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                              <input
                                type="text"
                                value={newCaseForm.opposingParty.organization}
                                onChange={(e) => handleNestedFormChange('opposingParty', 'organization', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter organization"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                value={newCaseForm.opposingParty.phone}
                                onChange={(e) => handleNestedFormChange('opposingParty', 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter phone"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={newCaseForm.opposingParty.email}
                                onChange={(e) => handleNestedFormChange('opposingParty', 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter email"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                              value={newCaseForm.opposingParty.address}
                              onChange={(e) => handleNestedFormChange('opposingParty', 'address', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>

                        {/* Opposing Counsel */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Opposing Counsel</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                              <input
                                type="text"
                                value={newCaseForm.opposingCounsel.name}
                                onChange={(e) => handleNestedFormChange('opposingCounsel', 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Firm</label>
                              <input
                                type="text"
                                value={newCaseForm.opposingCounsel.firm}
                                onChange={(e) => handleNestedFormChange('opposingCounsel', 'firm', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter firm name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                value={newCaseForm.opposingCounsel.phone}
                                onChange={(e) => handleNestedFormChange('opposingCounsel', 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter phone"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={newCaseForm.opposingCounsel.email}
                                onChange={(e) => handleNestedFormChange('opposingCounsel', 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter email"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                              value={newCaseForm.opposingCounsel.address}
                              onChange={(e) => handleNestedFormChange('opposingCounsel', 'address', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>

                        {/* Witnesses */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900">Witnesses</h5>
                            <button
                              type="button"
                              onClick={() => handleFormChange('witnesses', [...newCaseForm.witnesses, { name: '', phone: '', email: '', address: '' }])}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add Witness
                            </button>
                          </div>
                          {newCaseForm.witnesses.map((witness, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="text-sm font-medium text-gray-700">Witness {index + 1}</h6>
                                <button
                                  type="button"
                                  onClick={() => handleFormChange('witnesses', newCaseForm.witnesses.filter((_, i) => i !== index))}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                  <input
                                    type="text"
                                    value={witness.name}
                                    onChange={(e) => {
                                      const newWitnesses = [...newCaseForm.witnesses]
                                      newWitnesses[index] = { ...witness, name: e.target.value }
                                      handleFormChange('witnesses', newWitnesses)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                  <input
                                    type="tel"
                                    value={witness.phone}
                                    onChange={(e) => {
                                      const newWitnesses = [...newCaseForm.witnesses]
                                      newWitnesses[index] = { ...witness, phone: e.target.value }
                                      handleFormChange('witnesses', newWitnesses)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter phone"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                  <input
                                    type="email"
                                    value={witness.email}
                                    onChange={(e) => {
                                      const newWitnesses = [...newCaseForm.witnesses]
                                      newWitnesses[index] = { ...witness, email: e.target.value }
                                      handleFormChange('witnesses', newWitnesses)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                  <input
                                    type="text"
                                    value={witness.address}
                                    onChange={(e) => {
                                      const newWitnesses = [...newCaseForm.witnesses]
                                      newWitnesses[index] = { ...witness, address: e.target.value }
                                      handleFormChange('witnesses', newWitnesses)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter address"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Additional Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Value
                          </label>
                          <input
                            type="number"
                            value={newCaseForm.estimatedValue}
                            onChange={(e) => handleFormChange('estimatedValue', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter estimated value"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                          </label>
                          <textarea
                            value={newCaseForm.note}
                            onChange={(e) => handleFormChange('note', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Additional notes about the case..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                      Reset Form
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Case'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matter Details Side Panel */}
      {showMatterPanel && selectedMatter && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeSidePanels}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Matter Details</h3>
                    <p className="text-sm text-gray-600">{selectedMatter.matterNumber}</p>
                  </div>
                  <button
                    onClick={closeSidePanels}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedMatter.title}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedMatter.description}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Practice Area</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedMatter.practiceArea}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</label>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
                          {selectedMatter.stage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Priority */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Status & Priority</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedMatter.status)}`}>
                            {selectedMatter.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(selectedMatter.priority)}`}>
                            {selectedMatter.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team & Dates */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Team & Dates</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responsible Attorney</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedMatter.responsibleAttorneyName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members</label>
                        <div className="mt-1 flex items-center -space-x-2">
                          {selectedMatter.teamMembers.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white"
                              title={`${member.name} - ${member.role}`}
                            >
                              {member.avatar}
                            </div>
                          ))}
                          {selectedMatter.teamMembers.length > 3 && (
                            <div className="w-8 h-8 bg-gray-300 text-gray-700 text-xs rounded-full flex items-center justify-center border-2 border-white">
                              +{selectedMatter.teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Next Key Date</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedMatter.nextKeyDate ? new Date(selectedMatter.nextKeyDate).toLocaleDateString() : 'No date set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Financial Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedMatter.estimatedValue ? `$${selectedMatter.estimatedValue.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedMatter.billStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                            selectedMatter.billStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedMatter.billStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedMatter.note && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Notes</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedMatter.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button className="btn btn-primary btn-sm flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Matter
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Side Panel */}
      {showClientPanel && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeSidePanels}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Client Details</h3>
                    <p className="text-sm text-gray-600">{selectedClient.name}</p>
                  </div>
                  <button
                    onClick={closeSidePanels}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedClient.name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedClient.email}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedClient.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Statistics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Client Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-xs font-medium text-blue-600">Active Cases</p>
                            <p className="text-lg font-bold text-blue-900">3</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-xs font-medium text-green-600">Total Value</p>
                            <p className="text-lg font-bold text-green-900">$85K</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Case MAT-2024-001 updated</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Document uploaded</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Meeting scheduled</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button className="btn btn-primary btn-sm flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Recent Activity Panel */}
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${
        isActivityPanelMinimized ? 'w-12' : 'w-80'
      }`}>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${isActivityPanelMinimized ? 'hidden' : 'block'}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => setIsActivityPanelMinimized(!isActivityPanelMinimized)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isActivityPanelMinimized ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Panel Content */}
          {!isActivityPanelMinimized && (
            <div className="overflow-y-auto" style={{ height: `${activityPanelHeight}px` }}>
              <div className="p-4 space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'create' ? 'bg-blue-500' :
                      activity.type === 'upload' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-yellow-500' :
                      activity.type === 'meeting' ? 'bg-purple-500' :
                      activity.type === 'contact' ? 'bg-indigo-500' :
                      activity.type === 'reminder' ? 'bg-red-500' :
                      activity.type === 'invoice' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.case}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">{activity.user}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Panel Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View All Activities
                </button>
              </div>
            </div>
          )}

          {/* Minimized State */}
          {isActivityPanelMinimized && (
            <div className="p-2">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Cases
