import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/dashboard'
import Footer from './components/footer'
import Navbar from './components/navbar'
import AuthenticatedNavbar from './components/AuthenticatedNavbar'
import Mapping from './components/mapping'
import EHR from './components/ehr'
import Audit from './components/audit'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Main App Layout Component
function AppLayout() {
  const { user, userProfile } = useAuth();
  
  return (
    <div className='font-inter'>
      {/* Conditional Navbar based on authentication */}
      {user && userProfile ? <AuthenticatedNavbar /> : <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Dashboard />} />
        
        {/* Protected Routes */}
        <Route 
          path='/mapping' 
          element={
            <ProtectedRoute roles={['doctor', 'admin']}>
              <Mapping />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/ehr' 
          element={
            <ProtectedRoute roles={['doctor', 'patient', 'admin']}>
              <EHR />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin-only Routes */}
        <Route 
          path='/audit' 
          element={
            <ProtectedRoute roles={['admin']}>
              <Audit />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Routes */}
        <Route 
          path='/profile' 
          element={
            <ProtectedRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
                <p className="text-gray-600">Profile management coming soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Patient-only Routes */}
        <Route 
          path='/my-records' 
          element={
            <ProtectedRoute roles={['patient']}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-800">My Health Records</h1>
                <p className="text-gray-600">Personal health records coming soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor/Admin Dashboard */}
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute roles={['doctor', 'admin']}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-800">Professional Dashboard</h1>
                <p className="text-gray-600">Analytics and management dashboard coming soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Other Routes */}
        <Route path='/about' element={<div className="p-8"><h1 className="text-2xl font-bold">About Us</h1></div>} />
        <Route path='/contact' element={<div className="p-8"><h1 className="text-2xl font-bold">Contact</h1></div>} />
        <Route path='/help' element={<div className="p-8"><h1 className="text-2xl font-bold">Help & Support</h1></div>} />
        <Route path='/notifications' element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1></div>} />
        
        {/* 404 Route */}
        <Route path='*' element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
