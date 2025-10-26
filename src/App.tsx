import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Clients from '@/pages/Clients'
import Cases from '@/pages/Cases'
import Documents from '@/pages/Documents'
import Invoices from '@/pages/Invoices'
import Profile from '@/pages/Profile'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/cases" element={<Cases />} />
                  <Route path="/cases/dashboard" element={<Cases />} />
                  <Route path="/cases/all-cases" element={<Cases />} />
                  <Route path="/cases/my-cases" element={<Cases />} />
                  <Route path="/cases/archived" element={<Cases />} />
                  <Route path="/cases/templates" element={<Cases />} />
                  <Route path="/cases/reports" element={<Cases />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
